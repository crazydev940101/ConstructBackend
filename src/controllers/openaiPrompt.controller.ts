import { OpenAIPromptKey } from "../sqlz/models/openaiPromptKey";
import { EOpenaiModel, IOpenAIPromptPayload } from "../interfaces";
import { OpenAIPrompt } from "../sqlz/models";

export const storePrompt = async (data: IOpenAIPromptPayload) => {
    if (!data.pKey) throw new Error('Prompt Key is required')
    let promptKey: OpenAIPromptKey | null = await OpenAIPromptKey.findOne({ where: { pKey: data.pKey } });
    if (!promptKey) {
        if (!data.description) throw new Error('Description is required.')
        promptKey = await OpenAIPromptKey.create({
            pKey: data.pKey,
            description: data.description,
            openaiModel: data.openaiModel || EOpenaiModel.TEXT_DAVINCI_003
        })
    }
    if (!data.prompt && !data.chatCompletionRequestMessages?.length) throw new Error('Prompt is required.');
    if(!data.prompt) {
        if(data.chatCompletionRequestMessages?.length) {
            data.prompt = ''
        }
    }
    // const prompt = await OpenAIPrompt.findOne({
    //     where: {
    //         promptKeyId: promptKey.id,
    //         prompt: data.prompt,
    //         chatCompletionRequestMessages: JSON.stringify(data.chatCompletionRequestMessages)
    //     }
    // })
    // if (!prompt)
    await OpenAIPrompt.create({
        promptKeyId: promptKey.id,
        prompt: data.prompt,
        chatCompletionRequestMessages: data.chatCompletionRequestMessages
    })
    return await getPromptByKey(data.pKey)
}

export const getPromptByKey = async (pKey: string) => {
    if (!pKey) throw new Error('Prompt Key is required')
    const promptKey: OpenAIPromptKey | null = await OpenAIPromptKey.findOne({ where: { pKey } });
    if (!promptKey) throw new Error(`Not found prompt key ${pKey}`)
    const prompt = await OpenAIPrompt.findAll({
        where: {
            promptKeyId: promptKey.id
        },
        include: [
            {
                model: OpenAIPromptKey,
                as: 'pKey',
                attributes: ['id', 'pKey', 'description'],
            }
        ],
        attributes: ['id', 'prompt', 'chatCompletionRequestMessages', 'promptKeyId', 'createdAt'],
        limit: 1,
        order: [['createdAt', 'DESC']]
    })
    return prompt[0]
}

export const getPrompts = async (): Promise<OpenAIPromptKey[]> => {
    return await OpenAIPromptKey.findAll({
        include: [
            {
                model: OpenAIPrompt,
                as: 'prompts',
                limit: 1,
                order: [['createdAt', 'DESC']],
                attributes: ['prompt', 'chatCompletionRequestMessages', 'createdAt']
            }
        ],
        attributes: ['id', 'pKey', 'description']
    })
}