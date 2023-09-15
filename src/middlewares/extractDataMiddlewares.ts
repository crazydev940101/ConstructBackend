import { NextFunction, Request, Response } from "express";
import { EUserRole } from "../interfaces/user";
import { SubscriptionPlan, SubscriptionResource, User, CompanySubscriptionResource, Company } from "../sqlz/models";
import { ESUBSCRIPTION_RESOURCE_KEY, FREE_LIMIT } from "../constants/subscriptionResourceKey";
import { getCompanySubscription } from "../controllers/stripe.controller";

export const checkRoleForExtract = async (req: Request, res: Response, next: NextFunction) => {
    const user = (req.user as any).data;
    try {
        const extractor = await User.findOne({ where: { id: user.id } })
        if (!extractor) throw new Error('Unauthenticated')
        req.body.companyId = extractor.companyId
        if (user.role !== EUserRole.VIEWER) {
            next();
            return
        }
        throw new Error("You don't have permission to ...")
    } catch (err) {
        res.status(401).json({
            status: 'failed',
            error: {
                message: (err as Error).message
            }
        })
    }
}

export const canExtract = async (companyId: number, counter: number | null) => {
    const c = counter || 0
    const company = await Company.findOne({ where: { id: companyId } })
    if (!company) throw new Error('Unauthenticated company')
    let resource = await CompanySubscriptionResource.findOne({
        where: {
            companyId: company.id,
            key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS
        }
    })
    if (!resource) {
        await CompanySubscriptionResource.create({
            companyId: company.id,
            key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS,
            value: 0
        })
        resource = await CompanySubscriptionResource.findOne({
            where: {
                companyId: company.id,
                key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS
            }
        })
    }
    if (!company.subscriptionPlanId) {
        if (!resource || resource.value < FREE_LIMIT) {
            if (c < FREE_LIMIT)
                return true
        }
        throw new Error('Free trial was expired. Please upgrade subscription.')
    }
    if (company.subscriptionPlanId && company.stripeSubscriptionCanceledAt) {
        throw new Error('Subscription was canceled')
    }

    const subscription = await getCompanySubscription(companyId)
    if (!subscription) throw new Error('Invalid subscription, please contact support')
    if (subscription.status !== "active") throw new Error(`Subscription is not active now, current status is <${subscription.status}>`)

    // pay as you go
    if ((subscription as any).plan?.transform_usage) return true;

    // regular monthly subscription & enterprise(contact sale) subscription
    const plan = await SubscriptionPlan.findOne({ where: { id: company.subscriptionPlanId } })
    if (!plan) throw new Error('Something went wrong. Please contact support.')
    let subscriptionResource: SubscriptionResource | null
    if (plan.stripePriceId) {
        subscriptionResource = await SubscriptionResource.findOne({
            where: {
                subscriptionPlanId: company.subscriptionPlanId,
                key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS
            }
        })
    } else {
        subscriptionResource = await SubscriptionResource.findOne({
            where: {
                subscriptionPlanId: company.subscriptionPlanId,
                key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS,
                companyId: company.id
            }
        })
    }
    if (!subscriptionResource) throw new Error('Something went wrong. Please contact support')
    if (!resource && c < subscriptionResource.value) {
        return true;
    }
    if (!resource || resource.value + c < subscriptionResource.value) {
        return true
    }
    throw new Error("Please upgrade your subscription.")
}

export const checkSubscriptionForExtract = async (req: Request, res: Response, next: NextFunction) => {
    const companyId = req.body.companyId;
    try {
        await canExtract(companyId, null)
        next()
    } catch (err) {
        res.status(401).json({
            status: 'failed',
            error: {
                message: (err as Error).message
            }
        })
    }
}

export const checkCompanyId = async (req: Request, res: Response, next: NextFunction) => {
    const user = (req.user as any).data;
    try {
        const extractor = await User.findOne({ where: { id: user.id } })
        if (!extractor) throw new Error('Unauthenticated')
        if (extractor.role === EUserRole.SYSTEM_ADMIN) {
            req.body.companyId = null
        } else {
            req.body.companyId = extractor.companyId
        }
        next();
    } catch (err) {
        res.status(401).json({
            status: 'failed',
            error: {
                message: (err as Error).message
            }
        })
    }
}