import { EMAIL_KEYS, sendMail } from "../services/mail";
import { config } from "../config/config";
import { ESUBSCRIPTION_RESOURCE_KEY } from "../constants/subscriptionResourceKey";
import { ISaleRequest } from "../interfaces";
import { Company, SaleRequest, SubscriptionPlan, SubscriptionResource, User } from "../sqlz/models"
import { stripe } from "./stripe.controller";
import { Op } from "sequelize";
import Stripe from "stripe";

export const requestSale = async (data: ISaleRequest, userId: number): Promise<SaleRequest> => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('Unregistered User')
  const request = await SaleRequest.findAll({
    where: {
      companyId: user.companyId,
      status: {
        [Op.in]: ['submitted', 'pending']
      }
    }
  })
  if (request.length > 0) throw new Error('The pending request still exists')
  const saleRequest = await SaleRequest.create({
    userId,
    companyId: user.companyId,
    description: data.description,
    status: 'submitted',
  })
  return saleRequest;
}

interface ICreatePlanPayload {
  price: number;
  amount: number;
  id: number;
}

/**
 * 
 * @param {ICreatePlanPayload} data 
 * @returns {Promise<SaleRequest | null>}
 */
export const createPlan = async (data: ICreatePlanPayload): Promise<SaleRequest | null> => {
  let request = await SaleRequest.findByPk(data.id)
  if (!request) throw new Error('Unsubmitted Request')
  if (!request.stripeSubscriptionId) {
    let enterprisePlan = await SubscriptionPlan.findOne({
      where: {
        stripePriceId: null
      }
    })
    if (!enterprisePlan) throw new Error('There is not enterprise plan. Please contact support team.')
    const user = await User.findOne({
      where: {
        id: request.userId
      },
      include: [
        {
          model: Company,
          as: 'company',
        }
      ]
    });
    if (!user) throw new Error('Unregistered User');
    let customerId;
    if (user.company.stripeCustomerId) {
      customerId = user.company.stripeCustomerId
    } else {
      if (user.stripeCustomerId) {
        customerId = user.stripeCustomerId
      } else {
        const customer = await stripe.customers.create({
          email: user.email
        });
        await User.update({
          stripeCustomerId: customer.id
        }, {
          where: {
            id: user.id
          }
        })
        await Company.update({
          stripeCustomerId: customer.id
        }, {
          where: {
            id: user.companyId
          }
        })
        customerId = customer.id
      }
    }
    let subscription
    const subscriptionParams: Stripe.SubscriptionUpdateParams = {
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      items: [{
        price_data: {
          currency: 'gbp',
          unit_amount: data.price * 100,
          product: enterprisePlan.stripeProductId,
          recurring: {
            interval: 'month'
          }
        }
      }]
    }
    if (user.company.stripeSubscriptionId) {
      subscription = await stripe.subscriptions.update(user.company.stripeSubscriptionId, subscriptionParams)
    } else {
      subscription = await stripe.subscriptions.create({ ...subscriptionParams, customer: customerId } as Stripe.SubscriptionCreateParams)
    }
    await SaleRequest.update({
      stripeSubscriptionId: subscription.id,
      price: data.price * 100,
      status: 'pending'
    }, {
      where: {
        id: data.id
      }
    })
    const sResource = await SubscriptionResource.findOne({
      where: {
        key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS,
        companyId: request.companyId
      }
    })
    if (sResource) {
      await SubscriptionResource.update({
        value: data.amount,
        subscriptionPlanId: enterprisePlan.id
      }, {
        where: {
          key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS,
          companyId: request.companyId
        }
      })
    } else {
      await SubscriptionResource.create({
        companyId: request.companyId,
        key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS,
        value: data.amount,
        subscriptionPlanId: enterprisePlan.id
      })
    }
    const emailData = {
      username: `${user?.firstname || ''} ${user?.lastname || ''}`,
      url: `${config.frontend}/app/billing?client_secret=${(subscription.latest_invoice as any)?.payment_intent?.client_secret}&publishable_key=${config.stripePublishableKey}`
    }
    sendMail({
      mail: EMAIL_KEYS.CUSTOM_SUBSCRIPTION,
      info: {
        to: [user?.email]
      },
      data: emailData
    })
  } else {
    throw new Error('The subscription already created.')
  }
  request = await SaleRequest.findByPk(data.id)
  return request
}

export const getPendingRequest = async (userId: number): Promise<SaleRequest | null> => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('Unregistered User')
  return await SaleRequest.findOne({
    where: {
      companyId: user.companyId,
      status: 'pending'
    }
  })
}

export const getDetail = async (id: number): Promise<SaleRequest | null | any> => {
  return await SaleRequest.findByPk(id, {
    include: [
      {
        model: Company,
        as: 'company',
        attributes: ['name', 'id'],
        include: [
          {
            model: SubscriptionResource,
            as: 'resources',
            attributes: ['id', 'key', 'value']
          }
        ]
      },
      {
        model: User,
        as: 'user',
        attributes: ['firstname', 'lastname', 'email', 'id']
      },
    ],
    attributes: ['id', 'description', 'price', 'status']
  })
}

export const getAllRequests = async (): Promise<SaleRequest[]> => {
  return await SaleRequest.findAll({
    include: [
      {
        model: Company,
        as: 'company',
        attributes: ['name', 'id']
      },
      {
        model: User,
        as: 'user',
        attributes: ['firstname', 'lastname', 'email', 'id']
      },
    ],
    attributes: ['id', 'description', 'status']
  })
}