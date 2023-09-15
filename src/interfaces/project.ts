export interface IProject {
    extractorId: number;
    projectName: string;
    projectId: string;
    projectLocation: string;
    companyId: number;
    isExtracting?: boolean;
    extractedAt?: Date;
}

export interface IProjectDetail extends IProject {
    id: number;
    createdAt?: Date,
    updatedAt?: Date,
}

export enum EInsightInventoryType {
    MATERIAL = 'material',
    PLANT = 'plant',
    TOOLS = 'tools',
    PPE = 'ppe'
}

export type TInventoryType = 'material' | 'plant' | 'tools' | 'ppe';

export type TInventoryTypeWithSupplier = TInventoryType | 'supplier' | 'all'

export type TDownloadFileType = 'xlsx' | 'csv'

export enum EDownloadFileType {
    XLSX = 'xlsx',
    CSV = 'csv'
}

export interface IDownloadParams {
    userId: number;
    projectId?: number;
    extractDataId?: number;
    inventoryType?: TInventoryTypeWithSupplier;
    fileType?: TDownloadFileType;
}