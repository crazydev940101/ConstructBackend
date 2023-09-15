import { getPromptByKey } from "../controllers/openaiPrompt.controller";
import { config } from "../config/config";
import { openai } from "./chatbot";
import { ChatBotHistory } from "../sqlz/models";
import { IChatInput } from "../interfaces";

export const mergePrompt = (prompt: string, text: string, data?: {
    [key: string]: string;
} | null) => {
    let p = `${prompt}`;
    p = p.replace('<question>', text);
    if (data)
        for (let i of Object.keys(data)) {
            p = p.replace(`{${i}}`, data[i])
        }
    return p
}

export const max_tokens = Number.isNaN(Number(config.openaiMaxTokens)) ? 100 : Number(config.openaiMaxTokens)
export const temperature = Number.isNaN(Number(config.openaiTemperature)) ? 0.9 : Number(config.openaiTemperature)

export const createCompletion = (txt: string) => openai.createCompletion({
    model: config.openaiModelId || 'text-davinci-003',
    prompt: txt,
    max_tokens,
    temperature
});

export const getSpecificDataWithPrompt = async (promptKey: string, message: string, chatInput: IChatInput, isPublic: boolean = false) => {
    const prompt = await getPromptByKey(promptKey)
    if (!prompt) throw new Error('Something went wrong with prompt. Please contact support.')
    const promptedMessage = mergePrompt(prompt.prompt, message)
    const response = await createCompletion(promptedMessage)
    const answer = response.data.choices[0].text as string;
    await ChatBotHistory.create({
        userId: chatInput.userId,
        question: chatInput.text,
        promptKeyId: prompt.pKey.id,
        promptVersion: prompt.createdAt,
        answer,
        isPublic
    })
    return answer.trim().toLowerCase()
}