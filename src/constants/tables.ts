export interface ITable {
  [key: string]: string;
}
export const TABLES: ITable = {
  SUBSCRIPTION_PLAN: "subscriptionPlan",
  COMPANY: "company",
  USER: "user",
  USER_SESSION: "userSession",
  SUBSCRIPTION_RESOURCE: "subscriptionResource",
  COMPANY_SUBSCRIPTION_RESOURCE: "companySubscriptionResource",
  EXTRACT_MODEL: "extractModel",
  PROJECT: "project",
  EXTRACT_DATA: "extractData",
  USER_SETTING: "userSetting",
  SALE_REQUEST: "saleRequest",
  CONTACT_REQUEST: "contactRequest",
  NEWSLETTER: "newsletter",
  SYSTEM_SETTING: "systemSetting",
  OPENAI_PROMPT_KEY: "openaiPromptKey",
  OPENAI_PROMPT: "openaiPrompt",
  CHATBOT_HISTORY: "chatbotHistory",
  DELIVERY_TICKET: "deliveryTicket",
  DELIVERY_ITEM: "deliveryItem",
  CARBON_EMISSION_FACTOR: "ceFactor",
};

export default TABLES;
