export interface ISubscriptionResource {
    id: number;
    subscriptionPlanId: number;
    key: string;
    value: number;
    companyId?: number | null;
}