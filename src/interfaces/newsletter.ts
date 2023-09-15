export interface INewsletterPayload {
    email: string;
    firstname: string;
    lastname: string;
    company: string;
    userId?: number | null;
}

export interface INewsletter extends INewsletterPayload {
    id: number;
    metadata: any;
    publicationId: string;
}