import { SearchClient, AzureKeyCredential } from "@azure/search-documents";
import { config } from "../config/config";

export const searchClient = new SearchClient(
    config.azureSearchEndpoint,
    config.azureSearchIndex,
    new AzureKeyCredential(config.azureSearchQueryApiKey)
)

export const searchDocumentsInFolder = async (searchText: string, folderName: string) => {
    const filter = `search.ismatch('${folderName}/*', 'metadata_storage_path')`;
    const options = {
        filter
    };
    const result = await searchClient.search(searchText, options);
    console.log(`Found ${(result.results as any).length} documents in folder ${folderName}`)
    return {
        data: result,
        message: `Found ${(result.results as any).length} documents in folder ${folderName}`
    }
}

export const searchDocuments = async (searchText: string) => {
    const result = await searchClient.search(searchText);
    console.log(`Found ${(result.results as any).length} documents.`)
    return {
        data: result,
        message: `Found ${(result.results as any).length} documents.`
    }
}

export const searchDocumentsWithPrefix = async (searchText: string, prefix: string, eq: boolean) => {
    const filter = eq ? `metadata_storage_name eq '${prefix}'` : `search.ismatch('${prefix}', 'metadata_storage_name', 'full', 'any')`;

    const searchResults = await searchClient.search(searchText, {
        includeTotalCount: true,
        filter,
    });
    const output = [];
    for await (const r of searchResults.results) {
        output.push(r);
    }
    console.log(`Found ${output.length} documents.`)
    return {
        data: output,
        message: `Found ${output.length} documents.`
    }
}