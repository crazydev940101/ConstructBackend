import { Configuration, OpenAIApi } from "openai";
import { config } from "../config/config";

const configuration = new Configuration({
    apiKey: config.openaiApiKey,
});

export const openai = new OpenAIApi(configuration);

export enum CHATBOT_MODELS {
    GPT_35_TURBO = 'gpt-3.5-turbo',
    TEXT_DAVINCI_003 = 'text-davinci-003',
}
