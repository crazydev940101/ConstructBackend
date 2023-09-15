export type TContactRequestStatus = 'pending' | 'completed' | 'declined';

export interface IContactRequest {
    id: number;
    userId?: number | null;
    name: string;
    email: string;
    company: string;
    description: string;
    status: TContactRequestStatus,
}

export interface ICreateContactRequestPayload {
    userId?: number | null;
    name: string;
    email: string;
    company: string;
    description: string;
}