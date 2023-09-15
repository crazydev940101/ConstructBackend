export type TSaleRequestStatus = 'submitted' | 'pending' | 'completed' | 'declined';

export interface ISaleRequest {
    id: number;
    companyId: number;
    userId: number;
    description: string;
    status: TSaleRequestStatus,
    stripeSubscriptionId?: string | null;
    price?: number | null;
}