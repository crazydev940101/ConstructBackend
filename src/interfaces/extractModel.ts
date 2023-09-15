export interface IExtractModel {
    modelId: string;
    modelDescription: string;
    appVersion: string;
    extractorName: string;
    extractorDescription: string;
    enabled: boolean;
}

export interface IExtractModelDetail extends IExtractModel {
    id: number;
    createdAt?: Date;
    updatedAt?: Date;
}