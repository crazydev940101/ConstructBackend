import { SubscriptionPlan, User, CompanySubscriptionResource, Company, SaleRequest, SubscriptionResource } from "../sqlz/models";
import { config } from "../config/config";
import Stripe from "stripe";
import { ESUBSCRIPTION_RESOURCE_KEY } from "../constants/subscriptionResourceKey";
import { ERROR_MESSAGES } from "../constants/ErrorType";

export const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2022-11-15'
})

export const createProduct = async () => {
  return stripe.products.create({
    name: 'Testing product'
  })
}

export const getProductList = async (): Promise<Stripe.Product[]> => {
  const productsResult = await stripe.products.list()
  const plans = await SubscriptionPlan.findAll({
    attributes: ['stripeProductId'],
    // where: {
    //   requestId: null
    // }
  })
  const planIds = plans.map(plan => plan.stripeProductId)
  const products = productsResult.data.filter(product => planIds.includes(product.id));
  if (products.length) {
    for (let idx = 0; idx < products.length; idx++) {
      if (products[idx].default_price) {
        products[idx].default_price = await stripe.prices.retrieve(products[idx].default_price as string)
      }
    }
  }
  const pricedProducts = products.filter(product => {
    return !!product.default_price
  }).sort((a, b) => Number((a.default_price as Stripe.Price).unit_amount) - Number((b.default_price as Stripe.Price).unit_amount))
  const unPricedProducts = products.filter(product => {
    return !product.default_price
  })
  return [...pricedProducts, ...unPricedProducts]
}

export const checkSubscription = async (userId: number): Promise<{
  isSubscribed: boolean;
  subscription: Stripe.Subscription | null;
  company: Company | null;
  subscriber: User | null;
}> => {
  const user = await User.findOne({
    where: { id: userId },
    include: {
      model: Company,
      as: 'company'
    }
  });
  let subscription: Stripe.Subscription | null = null
  const isSubscribed = !!user?.company?.stripeSubscriptionId && !user.company.stripeSubscriptionCanceledAt
  let subscribedUser = null;
  let company: Company | null = null;
  if (isSubscribed) {
    subscription = await stripe.subscriptions.retrieve(user?.company?.stripeSubscriptionId)
    if (subscription) {
      const product = await stripe.products.retrieve((subscription as any).plan.product);
      (subscription as any).plan.product = product
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      subscription.customer = customer;
      company = await Company.findOne({where: {stripeCustomerId: customer.id}, attributes: ['name']})
    }
    if (user?.stripeCustomerId !== user?.company.stripeCustomerId)
      subscribedUser = await User.findOne({ where: { stripeCustomerId: user?.company.stripeCustomerId }, attributes: ['email'] })
  }
  return {
    isSubscribed,
    subscription,
    company,
    subscriber: subscribedUser
  };
}

export const getCompanySubscription = async (companyId: number): Promise<Stripe.Subscription | null> => {
  const company = await Company.findByPk(companyId);
  if (!company) throw new Error('Unregistered company');
  if (!company.stripeSubscriptionId) throw new Error(ERROR_MESSAGES.UNSUBSCRIBED_COMPANY);
  if (company.stripeSubscriptionCanceledAt) throw new Error('subscription was canceled')
  return await stripe.subscriptions.retrieve(company.stripeSubscriptionId)
}

export const createUsageRecord = async (stripeSubscriptionItemId: string, amount: number): Promise<Stripe.Response<Stripe.UsageRecord>> => {
  return await stripe.subscriptionItems.createUsageRecord(
    stripeSubscriptionItemId,
    {
      quantity: amount,
      timestamp: parseInt(`${Date.now() / 1000}`),
      action: 'increment',
    }
  );
}

export const constructEvent = stripe.webhooks.constructEvent;

export const billing = async (userId: number) => {
  const user = await User.findOne({
    where: { id: userId },
    include: {
      model: Company,
      as: 'company'
    }
  });
  if (!user) throw new Error('Unregistered User');
  let customerId = user.company.stripeCustomerId
  if (!customerId) {
    customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      await User.update({ stripeCustomerId: customer.id }, { where: { id: user.id } })
      customerId = customer.id
    }
    await Company.update({ stripeCustomerId: customerId }, { where: { id: user.companyId } })
  }
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${config.frontend}/app`,
  });
}

export const createCheckoutSession = async (userId: string, priceId: string, redirectHost: string): Promise<string> => {
  const user = await User.findOne({
    where: { id: userId },
    include: {
      model: Company,
      as: 'company'
    }
  });
  if (!user) throw new Error('Unregistered User')
  if (user.company.stripeSubscriptionId && !user.company.stripeSubscriptionCanceledAt) {
    throw new Error('joined')
  }
  let customerId = user.company.stripeCustomerId
  if (!customerId) {
    customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      await User.update({ stripeCustomerId: customer.id }, { where: { id: user.id } })
      customerId = customer.id
    }
    await Company.update({ stripeCustomerId: customerId }, { where: { id: user.companyId } })
  }
  const price = await stripe.prices.retrieve(priceId);
  let line_item: {
    price: string;
    quantity?: number;
  } = {
    price: priceId,
    quantity: 1,
  };
  if (price.transform_quantity) {
    delete line_item.quantity
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [
      line_item,
    ],
    success_url: `${redirectHost}/app/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${redirectHost}/app/billing?error=canceled`,
  });
  const url = session.url
  return url as string
}

export const storeSubscription = async (customerSubscription: Stripe.Subscription) => {
  const customerId = customerSubscription.customer as string
  const productId = (customerSubscription as any).plan.product
  const subscription = await SubscriptionPlan.findOne({ where: { stripeProductId: productId } })
  if (!subscription) throw new Error('Please update subscritpions in db')
  let company = await Company.findOne({
    where: {
      stripeCustomerId: customerId
    }
  })
  if (!company) {
    const user = await User.findOne({
      where: {
        stripeCustomerId: customerId
      },
      include: [
        {
          model: Company,
          as: 'company'
        }
      ]
    })
    if (!user)
      throw new Error('Something went wrong when confirming company with customerId. Please contact support.')
    company = user.company
  }
  await Company.update(
    {
      stripeSubscriptionId: customerSubscription.id,
      subscriptionPlanId: subscription.id,
      stripeCustomerId: customerId,
      stripeSubscriptionCanceledAt: customerSubscription.canceled_at ? new Date(customerSubscription.canceled_at) : null
    }, {
    where: {
      id: company.id
    }
  })
  const saleRequest = await SaleRequest.findOne({
    where: {
      stripeSubscriptionId: customerSubscription.id
    }
  })
  if (saleRequest) {
    await SaleRequest.update({
      status: 'completed'
    }, {
      where: {
        stripeSubscriptionId: customerSubscription.id
      }
    })
    // let company = await Company.findOne({
    //   where: {
    //     stripeCustomerId: customerId
    //   }
    // })
    // if (!company) {
    //   const user = await User.findOne({
    //     where: {
    //       stripeCustomerId: customerId
    //     },
    //     include: [
    //       {
    //         model: Company,
    //         as: 'company'
    //       }
    //     ]
    //   })
    //   if (!user)
    //     throw new Error('Something went wrong when confirming company with customerId. Please contact support.')
    //   company = user.company
    // }
    // const resource = await SubscriptionResource.findOne({
    //   where: {
    //     companyId: company?.id,
    //     subscriptionPlanId: subscription.id,
    //     key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS
    //   }
    // })
    // if (resource) {
    //   await SubscriptionResource.update({
    //     value: 0,
    //   }, {
    //     where: {
    //       companyId: company?.id,
    //       subscriptionPlanId: subscription.id,
    //       key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS
    //     }
    //   })
    // } else {
    //   await SubscriptionResource.create({
    //     companyId: company.id,
    //     subscriptionPlanId: subscription.id,
    //     key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS,
    //     value: 0
    //   })
    // }
  }
  // const company = await Company.findOne({ where: { stripeCustomerId: customerId } })
  // if (!company) throw new Error('Something went wrong. Please contact support.')
  const companySubscriptionResource = await CompanySubscriptionResource.findOne({ where: { companyId: company.id } })
  if (companySubscriptionResource) {
    await CompanySubscriptionResource.update({ value: 0 }, { where: { companyId: company.id } })
  } else {
    await CompanySubscriptionResource.create({
      companyId: company.id,
      key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS,
      value: 0
    })
  }
}

export const stripeHooks = async (event: Stripe.Event) => {
  try {
    switch (event.type) {
      // case 'payment_intent.created':
      //   const paymentIntentCreated = event.data.object as Stripe.Subscription;
      //   console.log('payment intent created => ', paymentIntentCreated)
      //   break;
      // case 'payment_intent.succeeded':
      //   const paymentIntentSucceeded = event.data.object as Stripe.Subscription;
      //   console.log('payment intent succeeded => ', paymentIntentSucceeded)
      //   break;
      case 'customer.subscription.updated':
        const customerSubscriptionUpdated = event.data.object as Stripe.Subscription;
        console.log('subscription updated => ', customerSubscriptionUpdated)
        await storeSubscription(customerSubscriptionUpdated)
        // Then define and call a function to handle the event customer.subscription.updated
        break;
      // case 'checkout.session.async_payment_failed':
      //   const checkoutSessionAsyncPaymentFailed = event.data.object;
      //   // Then define and call a function to handle the event checkout.session.async_payment_failed
      //   break;
      // case 'checkout.session.async_payment_succeeded':
      //   const checkoutSessionAsyncPaymentSucceeded = event.data.object;
      //   // Then define and call a function to handle the event checkout.session.async_payment_succeeded
      //   break;
      // case 'checkout.session.completed':
      //   const checkoutSessionCompleted = event.data.object;
      //   // Then define and call a function to handle the event checkout.session.completed
      //   break;
      // case 'checkout.session.expired':
      //   const checkoutSessionExpired = event.data.object;
      //   // Then define and call a function to handle the event checkout.session.expired
      //   break;
      // case 'customer.created':
      //   const customerCreated = event.data.object;
      //   console.log('customer created => ', customerCreated)
      //   // Then define and call a function to handle the event customer.created
      //   break;
      // case 'customer.deleted':
      //   const customerDeleted = event.data.object;
      //   console.log('customer deleted => ', customerDeleted)
      //   // Then define and call a function to handle the event customer.deleted
      //   break;
      // case 'customer.subscription.created':
      //   const customerSubscriptionCreated = event.data.object as Stripe.Subscription;
      //   console.log('subscription created => ', customerSubscriptionCreated)
      //   // Then define and call a function to handle the event customer.subscription.created
      //   if (customerSubscriptionCreated.status === 'active')
      //     await storeSubscription(customerSubscriptionCreated)
      //   break;
      case 'customer.subscription.deleted':
        const customerSubscriptionDeleted = event.data.object as Stripe.Subscription;
        console.log('subscription deleted => ', customerSubscriptionDeleted)
        await storeSubscription(customerSubscriptionDeleted)
        // Then define and call a function to handle the event customer.subscription.deleted
        break;
      // case 'invoice.created':
      // case 'invoice.deleted':
      // case 'invoice.finalization_failed':
      // case 'invoice.finalized':
      // case 'invoice.marked_uncollectible':
      // case 'invoice.payment_action_required':
      case 'invoice.payment_failed':
        const invoicePaymentFailed = event.data.object;
        console.log('invoice payment failed => ', invoicePaymentFailed)
        // Then define and call a function to handle the event invoice.payment_failed
        break;
      // case 'invoice.payment_succeeded':
      // case 'invoice.sent':
      // case 'invoice.upcoming':
      // case 'invoice.updated':
      // case 'invoice.voided':
      case 'invoice.paid':
        const invoicePaid = event.data.object;
        console.log('invoice paid => ', invoicePaid)
        // Then define and call a function to handle the event invoice.paid
        break;
      // case 'customer.subscription.paused':
      //   const customerSubscriptionPaused = event.data.object;
      //   console.log('subscription paused => ', customerSubscriptionPaused)
      //   // Then define and call a function to handle the event customer.subscription.paused
      //   break;
      // case 'customer.subscription.pending_update_applied':
      //   const customerSubscriptionPendingUpdateApplied = event.data.object;
      //   // Then define and call a function to handle the event customer.subscription.pending_update_applied
      //   break;
      // case 'customer.subscription.pending_update_expired':
      //   const customerSubscriptionPendingUpdateExpired = event.data.object;
      //   // Then define and call a function to handle the event customer.subscription.pending_update_expired
      //   break;
      // case 'customer.subscription.resumed':
      //   const customerSubscriptionResumed = event.data.object;
      //   // Then define and call a function to handle the event customer.subscription.resumed
      //   break;
      // case 'customer.subscription.trial_will_end':
      //   const customerSubscriptionTrialWillEnd = event.data.object;
      //   // Then define and call a function to handle the event customer.subscription.trial_will_end
      //   break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type => ${event.type} => `, event.data.object);
    }
  } catch (err) {
    console.log('Internal error in handling stripe hook => ', (err as Error).message)
  }
}