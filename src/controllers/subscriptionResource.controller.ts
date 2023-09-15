import { SubscriptionResource } from "../sqlz/models";
import ErrorType from "../constants/ErrorType";
import ForbiddenError from "../exceptions/ForbiddenError";
import { ISubscriptionResource } from "../interfaces/subscriptionResource";

/**
 * Insert subscription resource.
 *
 * @param {ISubscriptionResource} params
 * @returns {Promise<SubscriptionResource>}
 */
export async function create(
  params: ISubscriptionResource
): Promise<SubscriptionResource> {
  try {
    const resource = await SubscriptionResource.create({
      subscriptionPlanId: params.subscriptionPlanId,
      key: params.key,
      value: params.value,
    });
    return resource;
  } catch (error) {
    throw error;
  }
}

/**
 * Update subscription resource
 * 
 * @param {number} id 
 * @param {ISubscriptionResource} params 
 * @return {Promise<SubscriptionResource | null>}
 */
export async function update(
  id: number,
  params: ISubscriptionResource
): Promise<SubscriptionResource | null> {
  try {
    await SubscriptionResource.update({
      ...params
    }, {
      where: {
        id
      }
    });
    const resource = await SubscriptionResource.findOne({ where: { id } });
    return resource;
  } catch(err) {
    throw err;
  }
}

/**
 * Get subscription resource list
 *
 * @returns {Promise<SubscriptionResource[]>}
 */
export async function getAll(): Promise<SubscriptionResource[]> {
  try {
    const resource = await SubscriptionResource.findAll();
    return resource;
  } catch (err) {
    throw err;
  }
}

/**
 * Get subscription resource detail with id
 * 
 * @param {number} id 
 * @returns {Promise<SubscriptionResource | null>}
 */
export async function get(id: number): Promise<SubscriptionResource | null> {
  try {
    const resource = await SubscriptionResource.findOne({ where: { id } })
    return resource;
  } catch (err) {
    throw err;
  }
}

/**
 * Delete subscription resource.
 *
 * @param {number} id
 * @returns {Promise<number>}
 */
export async function remove(id: number): Promise<number> {
  try {
    const resource = await SubscriptionResource.destroy({
      where: {
        id
      }
    })
    return resource;
  } catch (err: any) {
    if (err.message === ErrorType.NO_ROWS_UPDATED_ERROR) {
      throw new ForbiddenError(err.message);
    }
    throw err;
  }
}
