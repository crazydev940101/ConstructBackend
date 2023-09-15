export interface IExtractData {
    projectId: number;
    blobName: string;
    documentLink: string;
    documentName: string;
    documentExtension: string;
    extractedData?: any;
    extractedDate?: Date;
}

export interface IExtractDataDetail extends IExtractData {
    id: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export type TExtractDataCategory = 'material' | 'plant' | 'tools' | 'ppe'
