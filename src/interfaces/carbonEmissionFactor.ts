export interface ICEFactorPayload {
    material: string;
    factor: number;
    companyId?: number;
}

export interface ICEFactor extends ICEFactorPayload {
    id?: number;
}