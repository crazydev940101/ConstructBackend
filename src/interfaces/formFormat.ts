import { TExtractDataCategory } from "./extractData";

export interface IDeliveryTicket {
    supplier: string | null;
    deliveryDate: Date | null;
}

export interface IDeliveryTicketDetail extends IDeliveryTicket {
    id: number;
    extractDataId: number;
}

export interface IDeliveryItem {
    inventory: string | null;
    quantity: number | null;
    unit: string | null;
    category: TExtractDataCategory;
    standardUnit?: string;
    convertedQuantity?: number;
    ceFactor?: number;
}

export interface IDeliveryItemDetail extends IDeliveryItem {
    id: number;
    ticketId: number;
}

export interface IComposed_v45 {
    supplier: string | null;
    deliveryDate: Date | null;
    details: IDeliveryItem[]
}

export interface IReceiptFormat {
    date: Date | string;
    supplier: string;
    address: any | string;
    item: any[];
    quantity: number | string;
    cost: number | string
}

export interface IIDFormat {
    country: any | string;
    document_number: string;
    first_name: string;
    last_name: string;
    address: any | string;
    date_of_birth: Date | string;
    date_of_expiration: Date | string;
    date_of_issue: Date | string;
    restrictions: string;
    vehicle_classification: string
}

export interface IInvoiceFormat {
    amount_due: number | string;
    item: any[];
    billing_address: any | string;
    customer_address: any | string;
    customer_name: string;
    customer_iD: string;
    due_date: Date | string;
    invoice_date: Date | string;
    invoice_iD: string;
    invoice_total: number | string;
    previous_unpaid_balance: number | string;
    purchase_order: string
}