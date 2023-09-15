import {
    BlobClient,
    BlobServiceClient,
    StoragePipelineOptions,
    BlobDeleteOptions,
    BlobDeleteIfExistsResponse,
    BlobSASPermissions,
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters
} from '@azure/storage-blob'
import { generateRandomString } from '../utils/string'
import { config } from '../config/config';

export const getBlobName = (originalName: string): string => {
    const identifier = generateRandomString(10);
    return `${originalName}_${identifier}`
}

export const getBlobServiceClientFromConnectionString = (): BlobServiceClient => {
    const connString = config.azureStorageConnectionString as string;
    if (!connString) throw Error('Azure Storage Connection string not found');

    const storagePipelineOptions: StoragePipelineOptions = {};

    const client: BlobServiceClient = BlobServiceClient.fromConnectionString(
        connString,
        storagePipelineOptions
    );
    return client;
}

export const blobServiceClient = getBlobServiceClientFromConnectionString();

export async function uploadFile(file: any, folder: string | null): Promise<{ blobName: string; url: string }> {
    try {
        console.log("Azure Blob storage v12 - JavaScript quickstart sample");

        const accountName = config.azureStorageAccountName;
        if (!accountName) throw Error('Azure Storage accountName not found');

        const containerName = config.azureStorageContainerName;

        console.log('\nCreating container...');
        console.log('\t', containerName);

        // Get a reference to a container
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Create a unique name for the blob
        let blobName: string = `${getBlobName(file.name)}`;

        // Create folder if it needed
        if(folder) {
            blobName = `${folder}/${blobName}`
        }

        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Display blob name and url
        console.log(
            `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`
        );

        // --------------------
        // 2. Upload data to the blob
        const uploadBlobResponse = await blockBlobClient.upload(file.data, file.data.length);
        console.log('uploadBlobResponse => ', uploadBlobResponse)
        return { blobName, url: blockBlobClient.url };
    } catch (err: any) {
        console.log(`Error: ${err.message}`);
        throw err
    }
}

/**
 * 
 * @param {string} blobName 
 * @param {any} writableStream 
 * @returns 
 */
export const downloadBlobAsStream = async (
    blobName: string,
    writableStream: any
) => {

    const AZURE_STORAGE_CONNECTION_STRING =
        config.azureStorageConnectionString;

    if (!AZURE_STORAGE_CONNECTION_STRING) {
        throw Error('Azure Storage Connection string not found');
    }

    // 1. Create the BlobServiceClient object with connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
        AZURE_STORAGE_CONNECTION_STRING
    );

    // Create a unique name for the container
    const containerName = config.azureStorageContainerName;

    console.log('\nCreating container...');
    console.log('\t', containerName);

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient: BlobClient = await containerClient.getBlobClient(blobName);

    const downloadResponse = await blobClient.download();

    if (!downloadResponse.errorCode && downloadResponse?.readableStreamBody) {
        console.log(`download of ${blobName} succeeded`);
        if (writableStream) {
            downloadResponse.readableStreamBody.pipe(writableStream);
        } else {
            return downloadResponse.readableStreamBody
        }
    }
}

/**
 * 
 * @param {string} blobName 
 * @param {Response} res 
 */
export const downloadFile = async (blobName: string, res: any) => {
    try {
        await downloadBlobAsStream(blobName, res)
    } catch (err) {
        res.status(400).json({
            error: {
                message: (err as Error).message
            }
        })
    }
}

/**
 * 
 * @param {string} blobName 
 * @returns {Promise<string>}
 */
export const deleteBlobIfItExists = async (
    blobName: string
): Promise<string> => {
    try {

        const AZURE_STORAGE_CONNECTION_STRING =
            config.azureStorageConnectionString;

        if (!AZURE_STORAGE_CONNECTION_STRING) {
            throw Error('Azure Storage Connection string not found');
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(
            AZURE_STORAGE_CONNECTION_STRING
        );

        const containerName = config.azureStorageContainerName;

        console.log('\nCreating container...');
        console.log('\t', containerName);

        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = await containerClient.getBlockBlobClient(blobName);

        const options: BlobDeleteOptions = {
            deleteSnapshots: 'include' // or 'only'
        };
        const blobDeleteIfExistsResponse: BlobDeleteIfExistsResponse =
            await blockBlobClient.deleteIfExists(options);

        if (!blobDeleteIfExistsResponse.errorCode) {
            console.log(`deleted blob ${blobName}`);
            return blobName;
        }
        throw new Error(`Failed to delete blob ${blobName}`)
    } catch (err) {
        throw err;
    }
}

/**
 * 
 * @param {string} blobName 
 * @param {number} duration // minutes 
 * @returns {Promise<string>} 
 */
export const getPublicLink = (blobName: string, duration: number = 5): string => {
    const permissions = new BlobSASPermissions();
    permissions.read = true;
    const currentDateTime = new Date();
    let d = duration ? duration : 5
    const expiryDateTime = new Date(currentDateTime.setMinutes(currentDateTime.getMinutes() + d))
    const blobSasModel = {
        containerName: config.azureStorageContainerName,
        blobName,
        permissions,
        expiresOn: expiryDateTime
    }
    const sharedKeyCredential = new StorageSharedKeyCredential(config.azureStorageAccountName, config.azureStorageAccountKey)
    const sasToken = generateBlobSASQueryParameters(blobSasModel, sharedKeyCredential)
    const containerClient = blobServiceClient.getContainerClient(config.azureStorageContainerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    return `${blockBlobClient.url}?${sasToken}`
}