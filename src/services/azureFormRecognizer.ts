import { config } from '../config/config';
import https from 'https';
import * as http from 'http';
import { DocumentAnalysisClient, AzureKeyCredential } from '@azure/ai-form-recognizer';
import { getPublicLink } from './azureBlob';

export const listModels = () => {
    const appVersion = '2022-08-31'
    let url = `${config.azureFormRecognizerEndpoint}/formrecognizer/documentModels?api-version=${appVersion}`;
    return new Promise((resolve, reject) => {
        try {
            const callback = (response: http.IncomingMessage) => {
                let str = '';

                response.on('data', function (chunk) {
                    str += chunk;
                });

                response.on('end', function () {
                    const parsedData = JSON.parse(str)
                    resolve(parsedData)
                });
            }
            https.request(url, { headers: { 'Ocp-Apim-Subscription-Key': config.azureFormRecognizerKey } }, callback).end();
        } catch (err) {
            reject(err)
        }
    })
}

export const analyzeOCR = async (model: string, blobName: string): Promise<any> => {
    try {
        const client = new DocumentAnalysisClient(config.azureFormRecognizerEndpoint, new AzureKeyCredential(config.azureFormRecognizerKey));
        const url = getPublicLink(blobName)
        const poller = await client.beginAnalyzeDocumentFromUrl(model, url);

        return await poller.pollUntilDone();
    } catch (error) {
        console.error("An error occurred:", error);
        throw error;
    }
}

export const analyzeInvoice = async (blobName: string) => {
    // sample document
    console.log('analyzeInvoice');
    try {
        const client = new DocumentAnalysisClient(config.azureFormRecognizerEndpoint, new AzureKeyCredential(config.azureFormRecognizerKey));
        const url = getPublicLink(blobName)
        const poller = await client.beginAnalyzeDocumentFromUrl("prebuilt-invoice", url);

        const {
            pages,
            tables, styles, keyValuePairs, documents
        } = await poller.pollUntilDone();
        console.log('keyValuePairs', keyValuePairs);
        if (keyValuePairs) {
            keyValuePairs.forEach((ele: any) => {
                let extractKey = ele.key["content"] ? ele.key["content"] : '';
                let extractValue = ele.value ? ele.value["content"] ? ele.value["content"] : '' : '';
                console.log(`${extractKey} ${extractValue} - confidence: ${ele.confidence}`);
            });
        }

        return keyValuePairs
    } catch (error) {
        console.error("An error occurred:", error);
        throw error;
    }
}

export const analyzeComposed_v45 = async (blobName: string) => {
    try {
        const client = new DocumentAnalysisClient(config.azureFormRecognizerEndpoint, new AzureKeyCredential(config.azureFormRecognizerKey));
        const url = getPublicLink(blobName)
        const poller = await client.beginAnalyzeDocumentFromUrl("Composed_v45", url);

        const { documents } = await poller.pollUntilDone();

        return documents;
    } catch (error) {
        console.error("An error occurred:", error);
        throw error;
    }
}