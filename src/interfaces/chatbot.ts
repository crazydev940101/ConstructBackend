import { ChatCompletionRequestMessage } from "openai";

export interface IChatInput {
    text: string;
    userId: number;
    extraText: string;
}

export interface IChatOutput {
    text: string;
}

export enum EOpenaiModel {
    TEXT_DAVINCI_003 = "text-davinci-003",
    GPT_35_TURBO = "gpt-3.5-turbo",
}

export interface IOpenAIPromptKeyPayload {
    pKey: string;
    openaiModel: EOpenaiModel;
    description: string;
}

export interface IOpenAIPromptKey extends IOpenAIPromptKeyPayload {
    id: number;
}

export interface IOpenAIPromptPayload {
    pKey: string;
    prompt: string;
    openaiModel: EOpenaiModel;
    chatCompletionRequestMessages?: ChatCompletionRequestMessage[] | null;
    description?: string | null;
}

export interface IOpenAIPrompt {
    id: number;
    promptKeyId: number;
    prompt: string;
    chatCompletionRequestMessages?: ChatCompletionRequestMessage[] | null;
}

export interface IChatBotHistoryPayload {
    userId: number;
    question: string;
    answer: string;
    promptKeyId: number;
    promptVersion: Date;
    isPublic: boolean; // if it is true, it is from user. if it is false, it is from system
    additionalData?: {
        [key: string]: string;
    } | null; // it is for prompt
}

export interface IChatBotHistory extends IChatBotHistoryPayload {
    id: number;
}
