export interface ICompany {
    id: number;
    longId?: string;
    name: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionPlanId?: number;
    stripeSubscriptionCanceledAt?: Date | null;
}