import * as dotenv from "dotenv";
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'production',
  host: (process.env.NODE_ENV || 'production') === 'production' ? process.env.TEST_HOST : process.env.HOST || 'http://localhost:8080',
  frontend: (process.env.NODE_ENV || 'production') === 'production' ? process.env.TEST_FRONT : process.env.FRONT || 'http://localhost:3000',
  port: Number(process.env.PORT) || 8080,
  saltRounds: Number(process.env.SALT_ROUNDS) || 11,
  accessTokenDuration: process.env.ACCESS_TOKEN_DURATION || "24h",
  refreshTokenDuration: process.env.REFRESH_TOKEN_DURATION || "1h",
  accessTokenSecretKey:
    process.env.ACCESS_TOKEN_SECRET_KEY || "<ACCESS_TOKEN_SECRET_KEY>",
  refreshTokenSecretKey:
    process.env.REFRESH_TOKEN_SECRET_KEY || "<REFRESH_TOKEN_SECRET_KEY>",
  sessionSecretKey:
    process.env.SESSION_SECRET_KEY || "<SESSION_SECRET_KEY>",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "<GOOGLE_CLIENT_ID>",
  googleClientSecret:
    process.env.GOOGLE_CLIENT_SECRET || "<GOOGLE_CLIENT_SECRET>",
  azureClientId: process.env.AZURE_CLIENT_ID || "<AZURE_CLIENT_ID>",
  azureClientSecret:
    process.env.AZURE_CLIENT_SECRET || "<AZURE_CLIENT_SECRET>",
  azureTenantId:
    process.env.AZURE_TENANT_ID || "<AZURE_TENANT_ID>",
  azureStorageConnectionString:
    process.env.AZURE_STORAGE_CONNECTION_STRING || "<AZURE_STORAGE_CONNECTION_STRING>",
  azureStorageContainerName:
    process.env.AZURE_STORAGE_CONTAINER_NAME || "<AZURE_STORAGE_CONTAINER_NAME>",
  azureStorageAccountName:
    process.env.AZURE_STORAGE_ACCOUNT_NAME || "<AZURE_STORAGE_ACCOUNT_NAME>",
  azureStorageAccountKey:
    process.env.AZURE_STORAGE_ACCOUNT_KEY || "<AZURE_STORAGE_ACCOUNT_KEY>",
  azureFormRecognizerEndpoint:
    process.env.AZURE_FORM_RECOGNIZER_ENDPOINT || "<AZURE_FORM_RECOGNIZER_ENDPOINT>",
  azureFormRecognizerKey:
    process.env.AZURE_FORM_RECOGNIZER_KEY || "<AZURE_FORM_RECOGNIZER_KEY>",
  azureSearchIndex:
    process.env.AZURE_SEARCH_INDEX || "<AZURE_SEARCH_INDEX>",
  azureSearchEndpoint:
    process.env.AZURE_SEARCH_ENDPOINT || "<AZURE_SEARCH_ENDPOINT>",
  azureSearchQueryApiKey:
    process.env.AZURE_SEARCH_QUERY_API_KEY || "<AZURE_SEARCH_QUERY_API_KEY>",
  azureSearchAdminApiKey:
    process.env.AZURE_SEARCH_ADMIN_API_KEY || "<AZURE_SEARCH_ADMIN_API_KEY>",
  azureSearchApiVersion:
    process.env.AZURE_SEARCH_API_VERSION || "<AZURE_SEARCH_API_VERSION>",
  stripeSecretKey: process.env.STRIPE_TEST_SECRET_KEY || '<STRIPE_TEST_SECRET_KEY>',
  stripePublishableKey: process.env.STRIPE_TEST_PUBLISHABLE_KEY || '<STRIPE_TEST_PUBLISHABLE_KEY>',
  stripeWebHookSecretKey: process.env.STRIPE_TEST_WEBHOOKS_SECRET_KEY || '<STRIPE_TEST_WEBHOOKS_SECRET_KEY>',
  sendgridApiKey: process.env.SENDGRID_API_KEY || '<SENDGRID_API_KEY>',
  atlassianApiKey: process.env.ATLASSIAN_API_TOKEN || '<ATLASSIAN_API_TOKEN>',
  jiraProjectName: process.env.JIRA_PROJECT_NAME || '<JIRA_PROJECT_NAME>',
  beehiivApiKey: process.env.BEEHIIV_API_KEY || '<BEEHIIV_API_KEY>',
  beehiivPublicationId: process.env.BEEHIIV_PUBLICATION_ID || '<BEEHIIV_PUBLICATION_ID>',
  openaiApiKey: process.env.OPENAI_API_KEY || '<OPENAI_API_KEY>',
  openaiModelId: process.env.OPENAI_MODEL_ID || '<OPENAI_MODEL_ID>',
  openaiMaxTokens: process.env.OPENAI_MAX_TOKENS || '<OPENAI_MAX_TOKENS>',
  openaiTemperature: process.env.OPENAI_TEMPERATURE || '<OPENAI_TEMPERATURE>',
};
