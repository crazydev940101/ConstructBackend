import { SubscriptionPlan } from "../sqlz/models";
import ErrorType from "../constants/ErrorType";
import ForbiddenError from "../exceptions/ForbiddenError";
import { ISubscriptionPlan } from "../interfaces/subscriptionPlan";
import { stripe } from "./stripe.controller";
import Stripe from "stripe";

/**
 * Insert subscription plan.
 *
 * @param {ISubscriptionPlan} params
 * @returns {Promise<SubscriptionPlan>}
 */
export async function create(
  params: ISubscriptionPlan
): Promise<SubscriptionPlan> {
  try {
    const subscription = await SubscriptionPlan.create({
      stripeProductId: params.stripeProductId,
      stripePriceId: params.stripePriceId,
    });
    return subscription;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

/**
 * Update subscription plan
 * 
 * @param {number} id 
 * @param {ISubscriptionPlan} params 
 * @return {Promise<SubscriptionPlan | null>}
 */
export async function update(
  id: number,
  params: ISubscriptionPlan
): Promise<SubscriptionPlan | null> {
  try {
    await SubscriptionPlan.update({
      ...params,
    }, {
      where: {
        id
      }
    });
    const plan = await SubscriptionPlan.findOne({ where: { id } });
    return plan;
  } catch (err) {
    throw err;
  }
}

/**
 * Get subscription plan list
 *
 * @returns {Promise<SubscriptionPlan[]>}
 */
export async function getAll(): Promise<SubscriptionPlan[]> {
  try {
    const plans = await SubscriptionPlan.findAll();
    return plans;
  } catch (err) {
    throw err;
  }
}

/**
 * Syncronize subscription plans from stripe
 */
export async function syncSubscription(): Promise<SubscriptionPlan[]> {
  try {
    const { data: products } = await stripe.products.list({active: true})
    if (products.length > 0) {
      for (let product of products) {
        const s = await SubscriptionPlan.findOne({ where: { stripeProductId: product.id } })
        if (s) {
          await SubscriptionPlan.update({
            stripePriceId: product.default_price as string
          },
            {
              where: {
                stripeProductId: product.id
              }
            })
        } else {
          const plan = new SubscriptionPlan({
            stripeProductId: product.id,
            stripePriceId: product.default_price as string
          })
          await plan.save()
        }
      }
    }
    const newPlans = await SubscriptionPlan.findAll();
    return newPlans
  } catch (err) {
    console.log(err)
    throw err
  }
}

/**
 * Get subscription plan detail with id
 * 
 * @param {number} id 
 * @returns {Promise<SubscriptionPlan | null>}
 */
export async function get(id: number): Promise<SubscriptionPlan | null> {
  try {
    const plan = await SubscriptionPlan.findOne({ where: { id } })
    return plan;
  } catch (err) {
    throw err;
  }
}

/**
 * Delete subscription plan.
 *
 * @param {number} id
 * @returns {Promise<number>}
 */
export async function remove(id: number): Promise<number> {
  try {
    const plan = await SubscriptionPlan.destroy({
      where: {
        id
      }
    })
    return plan;
  } catch (err: any) {
    if (err.message === ErrorType.NO_ROWS_UPDATED_ERROR) {
      throw new ForbiddenError(err.message);
    }
    throw err;
  }
}
