export enum ESUBSCRIPTION_RESOURCE_KEY {
    MAX_NUMBER_OF_DOCUMENTS = 'max-number-of-documents' // Max number of documents for extraction
}

export const SUBSCRIPTION_RESOURCE_KEYS: string[] = [
    ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS
]

// export const SUBSCRIPTION_FREE_TRIAL_PERIOD = 7 * 24 * 60 * 60 * 1000

export const FREE_LIMIT = 100;
// export const FREE_LIMIT = 10; // For testing
