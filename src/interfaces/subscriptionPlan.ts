export interface ISubscriptionPlan {
    id: number;
    stripeProductId: string;
    stripePriceId?: string | null;
}