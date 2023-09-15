import { openai } from "../services/chatbot";
import { IChatInput, TExtractDataCategory } from "../interfaces";
// import { createCompletion, getSpecificDataWithPrompt, mergePrompt } from "../services/prompt";
import { ChatBotHistory, User } from "../sqlz/models";
import { getPromptByKey } from "./openaiPrompt.controller";
import { config } from "../config/config";
import sequelize from "../sqlz/models/_index";
import { buildSQL } from "../services/sql";

export const extractIntent = async (params: IChatInput): Promise<string> => {
    const message = params.text;
    const user = await User.findByPk(params.userId)
    if (!user) throw new Error(`User ${params.userId} does not exist`);
    // extract intent & variables from the sentense.
    const prompt = await getPromptByKey('extract-intent-as-json')
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                // Action can be "get_delivery_count" or "list_project"
                content: `This year is ${new Date().getFullYear()}. I want you to act as a intent extractor. I will write a sentense and you will detect intent and useful variables from the sentense. Only answer like the following form.
                {
                    "action": "string",
                    "delivery_item": "string",
                    "sort_by": "string",
                    "sort_direction": "string",
                    "supplier": "string",
                    "time_period": "string",
                    "start_time": "date",
                    "end_time": "date",
                    "limit": "number"
                }.
                Action is the intent, action can be only one of get_project_list, get_projects, get_deliveries_count, get_delivery_items, and others.
                In action, delivery_item can be only one or combination(with comma) of material, tools, plant, ppe(it is the abbreviation of personal protect equipment), and null.
                JSON ONLY. NO DISCUSSION.\n\n`
            },
            {
                role: 'user',
                content: 'List all projects over the last 3 months by date.'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "get_project_list",
                    "sort_by": "createdAt",
                    "sort_direction": "desc",
                    "time_period": "3 months",
                    "end_time": "now"
                }`
            },
            {
                role: 'user',
                content: 'How many deliveries did we get from Breedon'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "get_deliveries_count",
                    "supplier": "Breedon"
                }`
            },
            {
                role: 'user',
                content: 'Give me the top 10 most used materials?'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "get_delivery_items",
                    "delivery_item": "material",
                    "sort_by": "count_delivery_items",
                    "sort_direction": "desc",
                    "limit": "10"
                }`
            },
            {
                role: 'user',
                content: 'Give me the top 10 least used materials?'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "get_delivery_items",
                    "delivery_item": "material",
                    "sort_by": "count_delivery_items",
                    "sort_direction": "asc",
                    "limit": "10"
                }`
            },
            {
                role: 'user',
                content: 'What materials used the most carbon emissions?'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "get_delivery_items",
                    "delivery_item": "material",
                    "sort_by": "carbon_emissions",
                    "sort_direction": "desc"
                }`
            },
            {
                role: 'user',
                content: 'summarise this document?'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "summarise_document"
                }`
            },
            {
                role: 'user',
                content: 'Simplify this document?'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "simplify_document"
                }`
            },
            {
                role: 'user',
                content: 'What projects used the most concrete?'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "get_projects",
                    "sort_by": "delivery_item_amount",
                    "delivery_item": "concrete",
                    "sort_direction": "desc"
                }`
            },
            {
                role: 'user',
                content: 'What projects used the most rebar?'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "get_projects",
                    "sort_by": "delivery_item_amount",
                    "delivery_item": "rebar",
                    "sort_direction": "desc"
                }`
            },
            {
                role: 'user',
                content: 'What projects used the least rebar?'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "get_projects",
                    "sort_by": "delivery_item_amount",
                    "delivery_item": "rebar",
                    "sort_direction": "asc"
                }`
            },
            {
                role: 'user',
                content: 'Over the last 3 months list the most used materials, tools and plant?'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "get_delivery_items",
                    "sort_by": "count_delivery_items",
                    "delivery_item": "material,tools,plant",
                    "sort_direction": "desc",
                    "time_period": "3 months",
                    "end_time": "now"
                }`
            },
            {
                role: 'user',
                content: 'Over the last 3 months list the most used materials by weight?'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "get_delivery_items",
                    "delivery_item": "material",
                    "sort_by": "weight",
                    "sort_direction": "desc",
                    "time_period": "3 months",
                    "end_time": "now"
                }`
            },
            {
                role: 'user',
                content: 'Who is the most used supplier?'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "get_suppliers",
                    "sort_by": "usage",
                    "sort_direction": "desc",
                    "limit": 1
                }`
            },
            {
                role: 'user',
                content: 'Rank the most used suppliers?'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "get_suppliers",
                    "sort_by": "usage",
                    "sort_direction": "desc",
                    "limit": 10
                }`
            },
            {
                role: 'user',
                content: 'List the plant we hired in the last 3 months?'
            },
            {
                role: 'assistant',
                content: `{
                    "action": "get_delivery_items",
                    "delivery_item": "plant",
                    "time_period": "3 months",
                    "sort_by": "date",
                    "end_time": "now"
                }`
            },
            // {
            //     role: 'user',
            //     content: ''
            // },
            // {
            //     role: 'assistant',
            //     content: `{
            //         'action': ''
            //     }`
            // },
            {
                role: 'user',
                content: `${message}`
            }
        ]
    })
    console.log(response)
    const answer = response.data.choices[0].message?.content || '';
    console.log(answer)
    await ChatBotHistory.create({
        userId: params.userId,
        question: message,
        promptKeyId: prompt.pKey.id,
        promptVersion: prompt.createdAt,
        answer,
        isPublic: false
    })
    try {
        const data = JSON.parse(answer)
        if (data.action === 'summarise_document' || data.action === 'simplify_document') {
            const selectedIntensity: string[] = [
                'basic understanding',
                'deep understanding',
                'completely disected'
            ];
            if (!params.extraText)
                return 'Please upload a document'
            const promptText = `Please ${data.action.split('_')[0]} the following text with ${selectedIntensity[0]} intensity: ${params.extraText}`;

            const prompt = await getPromptByKey('summarise-pdf');
            try {
                const response = await openai.createChatCompletion({
                    model: 'gpt-3.5-turbo-16k',
                    messages: [
                        {
                            role: 'user',
                            content: `${promptText}`
                        }
                    ]
                })
                const summarisedAnswer = response.data.choices[0].message?.content || '';
                await ChatBotHistory.create({
                    userId: params.userId,
                    question: message,
                    promptKeyId: prompt.pKey.id,
                    promptVersion: prompt.createdAt,
                    answer: summarisedAnswer,
                    isPublic: false
                })
                console.log(summarisedAnswer)
                return summarisedAnswer
            } catch(err: any) {
                if(err.response?.data?.error?.code === 'context_length_exceeded') {
                    return 'File content is too large.'
                }
                throw err
            }
        } else {
            const query = buildSQL(data, user.companyId);
            console.log(query)
            if (!query) throw new Error('This is a general question.')
            const result = await sequelize.query(query)
            console.log(result)

            console.log(result[0])

            // const b = answer.trim().toLowerCase()
            // console.log(b)
            let resultStr = ''
            if (Array.isArray(result[0]) && result[0].length) {
                result[0].forEach((r: any) => {
                    Object.values(r).forEach(v => {
                        resultStr += `${v}, `
                    })
                    resultStr += `\n`
                })
            }
            console.log(resultStr)
            if(resultStr === '') resultStr = 'There is Nothing'
            const prompt = await getPromptByKey('refine-answer');
            const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `Assistant helps the company employees with their project and delivery ticket, delivery items. Be brief in your answers.
                        Answer ONLY with the facts listed in the list of sources below. Do not generate answers that don't use the sources below.
                        Only Refine the following answer for the following question. Only the refined answer without the unnecessary description.`
                    },
                    {
                        role: 'user',
                        content: `${message}`
                    },
                    {
                        role: 'assistant',
                        content: `${resultStr}`
                    }
                ]
            })
            const refinedAnswer = response.data.choices[0].message?.content || '';
            await ChatBotHistory.create({
                userId: params.userId,
                question: message,
                promptKeyId: prompt.pKey.id,
                promptVersion: prompt.createdAt,
                answer: refinedAnswer,
                isPublic: false
            })

            return refinedAnswer
        }
    } catch (err) {
        console.log(err)
        const prompt = await getPromptByKey('general-question');
        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `${message}`
                }
            ]
        })
        const answer = response.data.choices[0].message?.content || '';
        await ChatBotHistory.create({
            userId: params.userId,
            question: message,
            promptKeyId: prompt.pKey.id,
            promptVersion: prompt.createdAt,
            answer,
            isPublic: false
        })
        return answer;
    }
}

export async function chat(
    params: IChatInput
): Promise<string> {

    const message = params.text
    const user = await User.findByPk(params.userId)
    if (!user) throw new Error(`User ${params.userId} does not exist`);
    // distinguish basic category if it is related carbon emission or it is others.
    /*
    const p = `Below is a question asked by the user.
Please specify which category the below question is asking about. The category can be one of carbon-emission and others. If the question is related to carbon emission, please reply carbon-emission, if it is not, please reply with others. Use double curly brackets to reference the category, e.g. {{carbon-emission}}, {{others}}. Answer without any additional information or context.
Question: <question>?`
    */
    /////////////////////////////////////////////
    // const a = await getSpecificDataWithPrompt('distinguish-basic-category', message, params)
    // console.log(a)
    // if (a.includes('{{others}}')) return a
    ////////////////////////////////////////////

    // extract variables from the sentense.
    const p = [`Extract variables, entities from the following sentence. Provide varialbes in JSON format without any additional description or context. If there are some data that related to date such as year, month, week, date and time, please provide it as ISO format.
Question: <question>`,
        `<question>`,

        `Act as a professional copywriter and designer. Please assist in creating text for a graphic design request.

About the design: '<text>'

Please provide two texts: a primary text and a secondary text. Each text should be limited to eight words or fewer. Additionally, include a recommended size for the design, choosing between square, landscape or portrait based on where the design will be used. (Example social timeline cover is landscape, Instagram post is square and story is portrait).

Include 1 keyword that can be used to search for stock images.

Please present the results in a JSON format using the following structure:

{
    'action': 'string', // list_projects, get_deliveries, top_materials, 
    'sort_by': 'string' // usage_count, carbon_emission
    'sort_direction': 'string' // asc, desc
    'supplier': 'string',
    'time_period': 'string',
    'start_time': 'date',
    'end_time': 'date',
    'limit': 'number',
    ''
}`,
        ``]
    // const prompt = await getPromptByKey('extract-variables-as-json')
    // const prompt = await getPromptByKey('extract-intent-as-json')
    const prompt = await getPromptByKey('extract-intent-as-sql')
    // const promptedMessage = mergePrompt(p[1], message)
    // console.log('prompted message => ', promptedMessage)
    // const response = await createCompletion(promptedMessage)
    // const response = await openai.createChatCompletion({
    //     model: 'gpt-3.5-turbo',
    //     messages: [
    //         {
    //             role: 'system',
    //             // Action can be "get_delivery_count" or "list_project"
    //             content: `You are a program that transforms user input to JSON of the following form.
    //             {
    //                 'action': 'string',
    //                 'sort_by': 'string',
    //                 'sort_direction': 'string',
    //                 'supplier': 'string',
    //                 'time_period': 'string',
    //                 'start_time': 'date',
    //                 'end_time': 'date',
    //                 'limit': 'number'
    //             }.
    //             JSON ONLY. NO DISCUSSION.\n\n`
    //         },
    //         {
    //             role: 'user',
    //             content: 'List all projects over the last 3 months by date.'
    //         },
    //         {
    //             role: 'assistant',
    //             content: `{
    //                 'action': 'chronological_list'
    //             }`
    //         },
    //         {
    //             role: 'user',
    //             content: 'How many deliveries did we get from Breedon'
    //         },
    //         {
    //             role: 'assistant',
    //             content: `{
    //                 'action': 'get_deliveries'
    //             }`
    //         },
    //         {
    //             role: 'user',
    //             content: 'Give me the top 10 most used materials?'
    //         },
    //         {
    //             role: 'assistant',
    //             content: `{
    //                 'action': 'get_materials'
    //             }`
    //         },
    //         {
    //             role: 'user',
    //             content: 'Give me the top 10 least used materials?'
    //         },
    //         {
    //             role: 'assistant',
    //             content: `{
    //                 'action': 'get_materials'
    //             }`
    //         },
    //         // {
    //         //     role: 'user',
    //         //     content: 'What materials used the most carbon emissions?'
    //         // },
    //         // {
    //         //     role: 'assistant',
    //         //     content: `{
    //         //         'action': ''
    //         //     }`
    //         // },
    //         // {
    //         //     role: 'user',
    //         //     content: ''
    //         // },
    //         // {
    //         //     role: 'assistant',
    //         //     content: `{
    //         //         'action': ''
    //         //     }`
    //         // },
    //         {
    //             role: 'user',
    //             content: `${message}`
    //         }
    //     ]
    // })
    // console.log(response)
    // const answer = response.data.choices[0].message?.content || '';
    // console.log(answer)
    const response = await openai.createCompletion({
        model: config.openaiModelId || 'text-davinci-003',
        prompt: `Below one is our database structure. It is PostgreSQL Database and all table name and field names are camel case.
        
        Table: project
        Columns: id, projectName, projectLocation, companyId, extractedAt

        Table: extractData
        Columns: id, projectId, blobName, documentLink, documentName, documentExtension

        Table: deliveryTicket
        Columns: id, extractDataId, supplier, deliveryDate

        Table: deliveryItem
        Columns: id, ticketId, inventory, quantity, unit, category

        Please provide PostgreSQL query to answer following question. The project's companyId is ${user.companyId}. Provide only SQL Query without any descriptions or keyworkds. In SQL query, use double quote for table name and field name.
        Question: ${message}?`,
        max_tokens: 2048,
        temperature: 0.7
    });
    const answer = response.data.choices[0].text as string
    console.log(answer)
    await ChatBotHistory.create({
        userId: params.userId,
        question: message,
        promptKeyId: prompt.pKey.id,
        promptVersion: prompt.createdAt,
        answer,
        isPublic: false
    })
    try {
        const result = await sequelize.query(answer)
        console.log(result[0])

        // const b = answer.trim().toLowerCase()
        // console.log(b)
        let resultStr = ''
        if (Array.isArray(result[0]) && result[0].length) {
            result[0].forEach((r: any) => {
                Object.values(r).forEach(v => {
                    resultStr += `${v}, `
                })
                resultStr += `\n`
            })
        }

        // const refinedResponse = await openai.createCompletion({
        //     model: config.openaiModelId || 'text-davinci-003',
        //     prompt: `Please refine below one to sentense in short.
        //     ${resultStr}`,
        //     max_tokens: 2048,
        //     temperature: 0.7 
        // });
        // const refinedAnswer = refinedResponse.data.choices[0].text as string
        // console.log(refinedAnswer)
        // await ChatBotHistory.create({
        //     userId: params.userId,
        //     question: message,
        //     promptKeyId: prompt.pKey.id,
        //     promptVersion: prompt.createdAt,
        //     answer: refinedAnswer,
        //     isPublic: false
        // })

        return resultStr
    } catch (err) {
        console.log(err)
        const response = await openai.createCompletion({
            model: config.openaiModelId || 'text-davinci-003',
            prompt: `${message}`,
            max_tokens: 2048,
            temperature: 0.7
        });
        const answer = response.data.choices[0].text as string
        console.log(answer)
        await ChatBotHistory.create({
            userId: params.userId,
            question: message,
            promptKeyId: prompt.pKey.id,
            promptVersion: prompt.createdAt,
            answer,
            isPublic: false
        })
        return answer
    }
}

export const chatv2 = async (params: IChatInput): Promise<string> => {
    const message = params.text
    // extract intent & variables from the sentense.
    const p = `I am building a chatbot that will assist customers in the construction industry. They will ask questions and the chatbot should analyze and retrieve data from our PostgreSQL database.

    Here are the details of the database tables and columns:
    
    Table: project
    Columns: id, extractorId, projectName, projectLocation, companyId, isExtracting, extractedAt
    
    Table: extractData
    Columns: projectId, blobName, documentLink, documentName, documentExtension
    
    Table: deliveryTicket
    Columns: extractDataId, supplier, deliveryDate
    
    Table: deliveryItem
    Columns: ticketId, inventory, quantity, unit, category
    
    Some questions are kind of general knowledge question, that being said it's not possible to get accurate sql query, in this case the chatbot should generate a general knowledge answer.
    
    To make more understandable, I provided the sample questions and desired outcome as below.

    Question: List all projects over the last 3 months by date
    Expected output: provide the sql query to get the below result.
    Chronological list
    
    Question: How many deliveries did we get from Breedon
    Expected output: provide the sql query to get the below result.
    A numbered list
    Breedon 1
    Breedon 2
    or
    a number of deliveries
    
    Question: Give me the top 10 most used materials?
    Expected output: provide the sql query to get the below result.
    Top 10 list of the most materials used
    
    Question: Give me the top 10 least used materials?
    Expected output: provide the sql query to get the below result.
    Top 10 list of the least materials used
    
    Question: What materials used the most carbon emissions?
    Expected output: provide the sql query to get the below result.
    List of materials that use th emost carbon emissions
    
    Question: summarise this document?
    Expected output: First require the client to upload file or input the filename which is stored in our database. And generate summarization of that file.
    Comment: Lots of construction documents are very long, boring and terrible so the user might want to understand the general meaning
    
    Question: Simplify this document?
    Expected output: First require the client to upload file or input the filename which is stored in our database. And rephrase that file to be simpler.
    Comment: Some people might not understand the technical terms in the documents and would like it ‘rephrased’ to be simpler
    
    Question: What projects used the most concrete?
    Expected output: provide the sql query to get the below result.
    A ranking of projects that use concrete and how much concrete they used (similar to top 10)
    
    Question: What projects used the most rebar?
    Expected output: provide the sql query to get the below result.
    A ranking of projects that use rebar and how much rebar they used (similar to top 10)
    
    Question: Over the last 3 months list the most used materials, tools and plant?
    Expected output: provide the sql query to get the below result.
    A list of materials, tools and plant
    
    Question: Over the last 3 months list the most used materials by weight?
    Expected output: provide the sql query to get the below result.
    A list showing the materials that collectively weighed the most
    
    Question: In Project where can I make carbon savings?
    Expected output: Retrieve all data(materialls, tools, plant) from the Project in the database and chatGPT makes recommendations based on materials, tools, plant.
    For example
    Use low emissions concrete
    Use electric plant
    
    Question: Create a carbon emissions report for Project
    Expected output: Retrieve all data(materialls, tools, plant) from the Project in the database and A Project report is created using the data in the ‘Project’
    Comment: It can already make carbon reports
    
    Question: Create a case study for Project
    Expected output: Retrieve all data(materialls, tools, plant) from the Project in the database and A Project case study is created using the data in the ‘Project’
    
    Question: Who is the most used supplier?
    Expected output: provide the sql query to get the below result.
    A single name
    
    Question: Rank the most used suppliers?
    Expected output: provide the sql query to get the below result.
    Lists the suppliers by the number of delivery tickets
    
    Question: How can I use PAS2050 or PAS2080
    Expected output: ChatGPT will give a summary of how to use it
    Comment: chatGPT knows a little about PAS2080 and PAS2050 regulations/frameworks
    
    Question: How can I use PAS2050 or PAS2080 with Project
    Expected output: Retrieve all data(materialls, tools, plant) from the Project in the database and ChatGPT will give a advice of how to apply these standards to our Project based on these data.
    
    Question: Create a comparison table that shows tools order by project
    Expected output: provide the sql query to get the below result.
    A table that lists tools in the delivery tickets by site.
    Comment: This lets the user know how tools they are buying per site
    
    Question: List all toxic and hazardous materials by Project
    Expected output: provide the sql query to get the below result.
    A list with of toxic and hazardous materials separated by Project
    Based on the above sample data, provide ideal answer for the below question.
    
    Question: ${message}`
    const prompt = await getPromptByKey('extract-intent-as-json')
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                // Action can be "get_delivery_count" or "list_project"
                content: `I want you to act as a intent extractor. I will give a question and you should analyze and retrieve useful data from the question in JSON format like below one.
                {
                    'action': 'string',
                    'sort_by': 'string',
                    'sort_direction': 'string',
                    'supplier': 'string',
                    'time_period': 'string',
                    'start_time': 'date',
                    'end_time': 'date',
                    'limit': 'number'
                }
                Action is the intent of the question.
                JSON ONLY. NO DISCUSSION.\n\n
                `
            },
            {
                role: 'user',
                content: 'List all projects over the last 3 months by date.'
            },
            {
                role: 'assistant',
                content: `{
                    'action': 'list_projects'
                }`
            },
            {
                role: 'user',
                content: 'How many deliveries did we get from Breedon'
            },
            {
                role: 'assistant',
                content: `delivery_count`
            },
            {
                role: 'user',
                content: 'Give me the top 10 most used materials?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                Top 10 list of the most materials used`
            },
            {
                role: 'user',
                content: 'Give me the top 10 least used materials?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                Top 10 list of the least materials used`
            },
            {
                role: 'user',
                content: 'What materials used the most carbon emissions?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                List of materials that use th emost carbon emissions`
            },
            {
                role: 'user',
                content: 'summarise this document?'
            },
            {
                role: 'assistant',
                content: `First require the client to upload file or input the filename which is stored in our database. And generate summarization of that file.
                Comment: Lots of construction documents are very long, boring and terrible so the user might want to understand the general meaning`
            },
            {
                role: 'user',
                content: 'Simplify this document?'
            },
            {
                role: 'assistant',
                content: `First require the client to upload file or input the filename which is stored in our database. And rephrase that file to be simpler.
                Comment: Some people might not understand the technical terms in the documents and would like it ‘rephrased’ to be simpler`
            },
            {
                role: 'user',
                content: 'What projects used the most concrete?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A ranking of projects that use concrete and how much concrete they used (similar to top 10)`
            },
            {
                role: 'user',
                content: 'What projects used the most rebar?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A ranking of projects that use rebar and how much rebar they used (similar to top 10)`
            },
            {
                role: 'user',
                content: 'Over the last 3 months list the most used materials, tools and plant?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A list of materials, tools and plant`
            },
            {
                role: 'user',
                content: 'Over the last 3 months list the most used materials by weight?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A list showing the materials that collectively weighed the most`
            },
            {
                role: 'user',
                content: 'In Project where can I make carbon savings?'
            },
            {
                role: 'assistant',
                content: `Retrieve all data(materialls, tools, plant) from the Project in the database and chatGPT makes recommendations based on materials, tools, plant.
                For example
                Use low emissions concrete
                Use electric plant`
            },
            {
                role: 'user',
                content: 'Create a carbon emissions report for Project'
            },
            {
                role: 'assistant',
                content: `Retrieve all data(materialls, tools, plant) from the Project in the database and A Project report is created using the data in the ‘Project’
                Comment: It can already make carbon reports`
            },
            {
                role: 'user',
                content: 'Create a case study for Project'
            },
            {
                role: 'assistant',
                content: `Retrieve all data(materialls, tools, plant) from the Project in the database and A Project case study is created using the data in the ‘Project’`
            },
            {
                role: 'user',
                content: 'Who is the most used supplier?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A single name`
            },
            {
                role: 'user',
                content: 'Rank the most used suppliers?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                Lists the suppliers by the number of delivery tickets`
            },
            {
                role: 'user',
                content: 'How can I use PAS2050 or PAS2080'
            },
            {
                role: 'assistant',
                content: `ChatGPT will give a summary of how to use it
                Comment: chatGPT knows a little about PAS2080 and PAS2050 regulations/frameworks`
            },
            {
                role: 'user',
                content: 'How can I use PAS2050 or PAS2080 with Project'
            },
            {
                role: 'assistant',
                content: `Retrieve all data(materialls, tools, plant) from the Project in the database and ChatGPT will give a advice of how to apply these standards to our Project based on these data.`
            },
            {
                role: 'user',
                content: 'Create a comparison table that shows tools order by project'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A table that lists tools in the delivery tickets by site.
                Comment: This lets the user know how tools they are buying per site`
            },
            {
                role: 'user',
                content: 'List all toxic and hazardous materials by Project'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A list with of toxic and hazardous materials separated by Project
                Based on the above sample data, provide ideal answer for the below question.`
            },
            // {
            //     role: 'user',
            //     content: ''
            // },
            // {
            //     role: 'assistant',
            //     content: `{
            //         'action': ''
            //     }`
            // },
            {
                role: 'user',
                content: `${message}`
            }
        ]
    })
    console.log(response)
    const answer = response.data.choices[0].message?.content || '';
    console.log(answer)
    await ChatBotHistory.create({
        userId: params.userId,
        question: message,
        promptKeyId: prompt.pKey.id,
        promptVersion: prompt.createdAt,
        answer,
        isPublic: false
    })
    return answer
}

export const chatv3 = async (params: IChatInput): Promise<string> => {
    const message = params.text
    const user = await User.findByPk(params.userId)
    if (!user) throw new Error(`User ${params.userId} does not exist`);
    // extract intent & variables from the sentense.
    const prompt = await getPromptByKey('extract-intent-as-sql')
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                // Action can be "get_delivery_count" or "list_project"
                content: `Below one is our database structure. It is PostgreSQL Database and all table name and field names are camel case.
        
                Table: project
                Columns: id, projectName, projectLocation, companyId, isExtracting, extractedAt
        
                Table: extractData
                Columns: id, projectId, blobName, documentLink, documentName, documentExtension
        
                Table: deliveryTicket
                Columns: id, extractDataId, supplier, deliveryDate
        
                Table: deliveryItem
                Columns: id, ticketId, inventory, quantity, unit, category
        
                Please provide PostgreSQL query to answer following question. The project's companyId is ${user.companyId}.
                Provide only SQL Query without any descriptions or keyworkds. In SQL query, use double quote in table name and field name.`
            },
            {
                role: 'user',
                content: 'List all projects over the last 3 months by date.'
            },
            {
                role: 'assistant',
                content: `SELECT "projectName", "extractedAt" FROM "project" WHERE "companyId" = 9 AND "extractedAt" >= NOW() - INTERVAL '3 MONTHS';`
            },
            {
                role: 'user',
                content: 'How many deliveries did we get from Breedon'
            },
            {
                role: 'assistant',
                content: `SELECT COUNT(*) as delivery_count FROM "deliveryTicket" dt JOIN "extractData" ed ON dt."extractDataId" = ed.id JOIN project p ON ed."projectId" = p.id WHERE dt.supplier = 'Breedon' AND p."companyId" = 9;`
            },
            {
                role: 'user',
                content: 'Give me the top 10 most used materials?'
            },
            {
                role: 'assistant',
                content: `SELECT inventory, SUM(quantity) AS total_quantity FROM "deliveryItem" di JOIN "deliveryTicket" dt ON di."ticketId" = dt.id JOIN "extractData" ed ON dt."extractDataId" = ed.id JOIN project p ON ed."projectId" = p.id WHERE p."companyId" = 9 GROUP BY inventory ORDER BY total_quantity DESC LIMIT 10;`
            },
            {
                role: 'user',
                content: 'Give me the top 10 least used materials?'
            },
            {
                role: 'assistant',
                content: `SELECT inventory, SUM(quantity) AS total_quantity FROM "deliveryItem" di JOIN "deliveryTicket" dt ON di."ticketId" = dt.id JOIN "extractData" ed ON dt."extractDataId" = ed.id JOIN project p ON ed."projectId" = p.id WHERE p."companyId" = 9 GROUP BY inventory ORDER BY total_quantity ASC LIMIT 10;`
            },
            {
                role: 'user',
                content: 'What materials used the most carbon emissions?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                List of materials that use th emost carbon emissions`
            },
            {
                role: 'user',
                content: 'summarise this document?'
            },
            {
                role: 'assistant',
                content: `First require the client to upload file or input the filename which is stored in our database. And generate summarization of that file.
                Comment: Lots of construction documents are very long, boring and terrible so the user might want to understand the general meaning`
            },
            {
                role: 'user',
                content: 'Simplify this document?'
            },
            {
                role: 'assistant',
                content: `First require the client to upload file or input the filename which is stored in our database. And rephrase that file to be simpler.
                Comment: Some people might not understand the technical terms in the documents and would like it ‘rephrased’ to be simpler`
            },
            {
                role: 'user',
                content: 'What projects used the most concrete?'
            },
            {
                role: 'assistant',
                content: `SELECT p."projectName", SUM(di.quantity) AS totalConcrete FROM project p JOIN "extractData" ed ON p.id = ed."projectId" JOIN "deliveryTicket" dt ON ed.id = dt."extractDataId" JOIN "deliveryItem" di ON dt.id = di."ticketId" WHERE di.inventory LIKE '%concrete%' AND p."companyId" = 9 GROUP BY p."projectName" ORDER BY totalConcrete DESC;`
            },
            {
                role: 'user',
                content: 'What projects used the most rebar?'
            },
            {
                role: 'assistant',
                content: `SELECT p."projectName", SUM(di.quantity) AS totalConcrete FROM project p JOIN "extractData" ed ON p.id = ed."projectId" JOIN "deliveryTicket" dt ON ed.id = dt."extractDataId" JOIN "deliveryItem" di ON dt.id = di."ticketId" WHERE di.inventory LIKE '%rebar%' AND p."companyId" = 9 GROUP BY p."projectName" ORDER BY totalConcrete DESC;`
            },
            {
                role: 'user',
                content: 'Over the last 3 months list the most used materials, tools and plant?'
            },
            {
                role: 'assistant',
                content: `SELECT di.inventory AS item, SUM(di.quantity) AS total_quantity FROM "deliveryItem" di JOIN "deliveryTicket" dt ON di."ticketId" = dt.id JOIN "extractData" ed ON dt."extractDataId" = ed.id JOIN project p ON ed."projectId" = p.id WHERE p."companyId" = 9 AND dt."deliveryDate" >= CURRENT_DATE - INTERVAL '3 MONTHS' AND (di.category = 'material' OR di.category = 'tools' OR di.category = 'plant') GROUP BY di.inventory ORDER BY total_quantity DESC;`
            },
            {
                role: 'user',
                content: 'Over the last 3 months list the most used materials by weight?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A list showing the materials that collectively weighed the most`
            },
            {
                role: 'user',
                content: 'In Project where can I make carbon savings?'
            },
            {
                role: 'assistant',
                content: `Retrieve all data(materialls, tools, plant) from the Project in the database and chatGPT makes recommendations based on materials, tools, plant.
                For example
                Use low emissions concrete
                Use electric plant`
            },
            {
                role: 'user',
                content: 'Create a carbon emissions report for Project'
            },
            {
                role: 'assistant',
                content: `Retrieve all data(materialls, tools, plant) from the Project in the database and A Project report is created using the data in the ‘Project’
                Comment: It can already make carbon reports`
            },
            {
                role: 'user',
                content: 'Create a case study for Project'
            },
            {
                role: 'assistant',
                content: `Retrieve all data(materialls, tools, plant) from the Project in the database and A Project case study is created using the data in the ‘Project’`
            },
            {
                role: 'user',
                content: 'Who is the most used supplier?'
            },
            {
                role: 'assistant',
                content: `SELECT supplier, COUNT(*) AS total_count FROM "deliveryTicket" dt JOIN "extractData" ed ON ed."id" = dt."extractDataId" JOIN project p ON p."id" = ed."projectId" WHERE p."companyId" = 9 GROUP BY supplier ORDER BY total_count DESC LIMIT 1;`
            },
            {
                role: 'user',
                content: 'Rank the most used suppliers?'
            },
            {
                role: 'assistant',
                content: `SELECT supplier, COUNT(*) AS total_count FROM "deliveryTicket" dt JOIN "extractData" ed ON ed."id" = dt."extractDataId" JOIN project p ON p."id" = ed."projectId" WHERE p."companyId" = 9 GROUP BY supplier ORDER BY total_count DESC LIMIT 10;`
            },
            {
                role: 'user',
                content: 'How can I use PAS2050 or PAS2080'
            },
            {
                role: 'assistant',
                content: `ChatGPT will give a summary of how to use it
                Comment: chatGPT knows a little about PAS2080 and PAS2050 regulations/frameworks`
            },
            {
                role: 'user',
                content: 'How can I use PAS2050 or PAS2080 with Project'
            },
            {
                role: 'assistant',
                content: `Retrieve all data(materialls, tools, plant) from the Project in the database and ChatGPT will give a advice of how to apply these standards to our Project based on these data.`
            },
            {
                role: 'user',
                content: 'Create a comparison table that shows tools order by project'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A table that lists tools in the delivery tickets by site.
                Comment: This lets the user know how tools they are buying per site`
            },
            {
                role: 'user',
                content: 'List all toxic and hazardous materials by Project'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A list with of toxic and hazardous materials separated by Project
                Based on the above sample data, provide ideal answer for the below question.`
            },
            // {
            //     role: 'user',
            //     content: ''
            // },
            // {
            //     role: 'assistant',
            //     content: `{
            //         'action': ''
            //     }`
            // },
            {
                role: 'user',
                content: `${message}`
            }
        ]
    })
    console.log(response)
    const answer = response.data.choices[0].message?.content || '';
    console.log(answer)
    await ChatBotHistory.create({
        userId: params.userId,
        question: message,
        promptKeyId: prompt.pKey.id,
        promptVersion: prompt.createdAt,
        answer,
        isPublic: false
    })
    try {
        const result = await sequelize.query(answer)
        console.log(result[0])

        // const b = answer.trim().toLowerCase()
        // console.log(b)
        let resultStr = ''
        if (Array.isArray(result[0]) && result[0].length) {
            result[0].forEach((r: any) => {
                Object.values(r).forEach(v => {
                    resultStr += `${v}, `
                })
                resultStr += `\n`
            })
        }

        return resultStr
    } catch (err) {
        console.log(err)
        const response = await openai.createCompletion({
            model: config.openaiModelId || 'text-davinci-003',
            prompt: `${message}`,
            max_tokens: 2048,
            temperature: 0.7
        });
        const answer = response.data.choices[0].text as string
        console.log(answer)
        await ChatBotHistory.create({
            userId: params.userId,
            question: message,
            promptKeyId: prompt.pKey.id,
            promptVersion: prompt.createdAt,
            answer,
            isPublic: false
        })
        return answer
    }
}

export const chatv1 = async (params: IChatInput): Promise<string> => {
    const message = params.text
    const user = await User.findByPk(params.userId)
    if (!user) throw new Error(`User ${params.userId} does not exist`);
    // extract intent & variables from the sentense.
    const p = `I am building a chatbot that will assist customers in the construction industry. They will ask questions and the chatbot should analyze and retrieve data from our PostgreSQL database.
    companyId is ${user.companyId}.
    Here are the details of the database tables and columns:
    
    Table: project
    Columns: id, extractorId, projectName, projectLocation, companyId, isExtracting, extractedAt
    
    Table: extractData
    Columns: projectId, blobName, documentLink, documentName, documentExtension
    
    Table: deliveryTicket
    Columns: extractDataId, supplier, deliveryDate
    
    Table: deliveryItem
    Columns: ticketId, inventory, quantity, unit, category
    
    Some questions are kind of general knowledge question, that being said it's not possible to get accurate sql query, in this case the chatbot should generate a general knowledge answer.
    
    To make more understandable, I provided the sample questions and desired outcome as below.

    Question: List all projects over the last 3 months by date
    Expected output: provide the sql query to get the below result.
    Chronological list
    
    Question: How many deliveries did we get from Breedon
    Expected output: provide the sql query to get the below result.
    A numbered list
    Breedon 1
    Breedon 2
    or
    a number of deliveries
    
    Question: Give me the top 10 most used materials?
    Expected output: provide the sql query to get the below result.
    Top 10 list of the most materials used
    
    Question: Give me the top 10 least used materials?
    Expected output: provide the sql query to get the below result.
    Top 10 list of the least materials used
    
    Question: What materials used the most carbon emissions?
    Expected output: provide the sql query to get the below result.
    List of materials that use th emost carbon emissions
    
    Question: summarise this document?
    Expected output: First require the client to upload file or input the filename which is stored in our database. And generate summarization of that file.
    Comment: Lots of construction documents are very long, boring and terrible so the user might want to understand the general meaning
    
    Question: Simplify this document?
    Expected output: First require the client to upload file or input the filename which is stored in our database. And rephrase that file to be simpler.
    Comment: Some people might not understand the technical terms in the documents and would like it ‘rephrased’ to be simpler
    
    Question: What projects used the most concrete?
    Expected output: provide the sql query to get the below result.
    A ranking of projects that use concrete and how much concrete they used (similar to top 10)
    
    Question: What projects used the most rebar?
    Expected output: provide the sql query to get the below result.
    A ranking of projects that use rebar and how much rebar they used (similar to top 10)
    
    Question: Over the last 3 months list the most used materials, tools and plant?
    Expected output: provide the sql query to get the below result.
    A list of materials, tools and plant
    
    Question: Over the last 3 months list the most used materials by weight?
    Expected output: provide the sql query to get the below result.
    A list showing the materials that collectively weighed the most
    
    Question: In Project where can I make carbon savings?
    Expected output: Retrieve all data(materialls, tools, plant) from the Project in the database and chatGPT makes recommendations based on materials, tools, plant.
    For example
    Use low emissions concrete
    Use electric plant
    
    Question: Create a carbon emissions report for Project
    Expected output: Retrieve all data(materialls, tools, plant) from the Project in the database and A Project report is created using the data in the ‘Project’
    Comment: It can already make carbon reports
    
    Question: Create a case study for Project
    Expected output: Retrieve all data(materialls, tools, plant) from the Project in the database and A Project case study is created using the data in the ‘Project’
    
    Question: Who is the most used supplier?
    Expected output: provide the sql query to get the below result.
    A single name
    
    Question: Rank the most used suppliers?
    Expected output: provide the sql query to get the below result.
    Lists the suppliers by the number of delivery tickets
    
    Question: How can I use PAS2050 or PAS2080
    Expected output: ChatGPT will give a summary of how to use it
    Comment: chatGPT knows a little about PAS2080 and PAS2050 regulations/frameworks
    
    Question: How can I use PAS2050 or PAS2080 with Project
    Expected output: Retrieve all data(materialls, tools, plant) from the Project in the database and ChatGPT will give a advice of how to apply these standards to our Project based on these data.
    
    Question: Create a comparison table that shows tools order by project
    Expected output: provide the sql query to get the below result.
    A table that lists tools in the delivery tickets by site.
    Comment: This lets the user know how tools they are buying per site
    
    Question: List all toxic and hazardous materials by Project
    Expected output: provide the sql query to get the below result.
    A list with of toxic and hazardous materials separated by Project
    Based on the above sample data, provide ideal answer for the below question.
    
    Question: ${message}`
    const prompt = await getPromptByKey('extract-intent-as-sql')
    console.log('chat v1 => \n')
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                // Action can be "get_delivery_count" or "list_project"
                content: `I am building a chatbot that will assist customers in the construction industry. They will ask questions and the chatbot should analyze and retrieve data from our PostgreSQL database.
                Here are the details of the database tables and columns:
                
                companyId is limited to ${user.companyId} for all queries.
                
                Table: project
                Columns: extractorId, projectName, projectId, projectLocation, companyId, isExtracting, extractedAt
                
                Table: extractData
                Columns: projectId, blobName, documentLink, documentName, documentExtension
                
                Table: deliveryTicket
                Columns: extractDataId, supplier, deliveryDate
                
                Table: deliveryItem
                Columns: ticketId, inventory, quantity, unit, category
                
                Some questions are kind of general knowledge question, that being said it's not possible to get accurate sql query, in this case the chatbot should generate a general knowledge answer.`
            },
            {
                role: 'user',
                content: 'List all projects over the last 3 months by date.'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                Chronological list`
            },
            {
                role: 'user',
                content: 'How many deliveries did we get from Breedon'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A numbered list
                Breedon 1
                Breedon 2
                or
                a number of deliveries`
            },
            {
                role: 'user',
                content: 'Give me the top 10 most used materials?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                Top 10 list of the most materials used`
            },
            {
                role: 'user',
                content: 'Give me the top 10 least used materials?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                Top 10 list of the least materials used`
            },
            {
                role: 'user',
                content: 'What materials used the most carbon emissions?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                List of materials that use th emost carbon emissions`
            },
            {
                role: 'user',
                content: 'summarise this document?'
            },
            {
                role: 'assistant',
                content: `First require the client to upload file or input the filename which is stored in our database. And generate summarization of that file.
                Comment: Lots of construction documents are very long, boring and terrible so the user might want to understand the general meaning`
            },
            {
                role: 'user',
                content: 'Simplify this document?'
            },
            {
                role: 'assistant',
                content: `First require the client to upload file or input the filename which is stored in our database. And rephrase that file to be simpler.
                Comment: Some people might not understand the technical terms in the documents and would like it ‘rephrased’ to be simpler`
            },
            {
                role: 'user',
                content: 'What projects used the most concrete?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A ranking of projects that use concrete and how much concrete they used (similar to top 10)`
            },
            {
                role: 'user',
                content: 'What projects used the most rebar?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A ranking of projects that use rebar and how much rebar they used (similar to top 10)`
            },
            {
                role: 'user',
                content: 'Over the last 3 months list the most used materials, tools and plant?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A list of materials, tools and plant`
            },
            {
                role: 'user',
                content: 'Over the last 3 months list the most used materials by weight?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A list showing the materials that collectively weighed the most`
            },
            {
                role: 'user',
                content: 'In Project where can I make carbon savings?'
            },
            {
                role: 'assistant',
                content: `Retrieve all data(materialls, tools, plant) from the Project in the database and chatGPT makes recommendations based on materials, tools, plant.
                For example
                Use low emissions concrete
                Use electric plant`
            },
            {
                role: 'user',
                content: 'Create a carbon emissions report for Project'
            },
            {
                role: 'assistant',
                content: `Retrieve all data(materialls, tools, plant) from the Project in the database and A Project report is created using the data in the ‘Project’
                Comment: It can already make carbon reports`
            },
            {
                role: 'user',
                content: 'Create a case study for Project'
            },
            {
                role: 'assistant',
                content: `Retrieve all data(materialls, tools, plant) from the Project in the database and A Project case study is created using the data in the ‘Project’`
            },
            {
                role: 'user',
                content: 'Who is the most used supplier?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A single name`
            },
            {
                role: 'user',
                content: 'Rank the most used suppliers?'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                Lists the suppliers by the number of delivery tickets`
            },
            {
                role: 'user',
                content: 'How can I use PAS2050 or PAS2080'
            },
            {
                role: 'assistant',
                content: `ChatGPT will give a summary of how to use it
                Comment: chatGPT knows a little about PAS2080 and PAS2050 regulations/frameworks`
            },
            {
                role: 'user',
                content: 'How can I use PAS2050 or PAS2080 with Project'
            },
            {
                role: 'assistant',
                content: `Retrieve all data(materials, tools, plant) from the Project in the database and ChatGPT will give a advice of how to apply these standards to our Project based on these data.`
            },
            {
                role: 'user',
                content: 'Create a comparison table that shows tools order by project'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A table that lists tools in the delivery tickets by site.
                Comment: This lets the user know how tools they are buying per site`
            },
            {
                role: 'user',
                content: 'List all toxic and hazardous materials by Project'
            },
            {
                role: 'assistant',
                content: `provide the sql query to get the below result.
                A list with of toxic and hazardous materials separated by Project
                Based on the above sample data, provide ideal answer for the below question.`
            },
            // {
            //     role: 'user',
            //     content: ''
            // },
            // {
            //     role: 'assistant',
            //     content: `{
            //         'action': ''
            //     }`
            // },
            {
                role: 'user',
                content: `${message}`
            }
        ]
    })
    console.log(response)
    const answer = response.data.choices[0].message?.content || '';
    console.log(answer)
    await ChatBotHistory.create({
        userId: params.userId,
        question: message,
        promptKeyId: prompt.pKey.id,
        promptVersion: prompt.createdAt,
        answer,
        isPublic: false
    })
    return answer
}

export const classifer = async (text: string): Promise<TExtractDataCategory | any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const txt = `In the construction sector, heavy machines should be referred to as plant rather than tools. And PPE means personal protective equipment. Please specify which category the below one belongs to: material, plant, tools, or PPE without any additional information or context.
            ${text}
            `
            // const txt = `In the construction sector, heavy machines should be referred to as plant rather than tools. And PPE means personal protective equipment. Please specify which category the below one belongs to: material, plant, tools, or PPE.
            // ${text}
            // `
            // const txt = `I am gonna classify the below item to these 3 categories(material, plants(it means heavy machine), tools) in the contruction sector.
            // Plz specify which category is this one belong to?
            // ${text}
            // `
            const response = await openai.createCompletion({
                model: process.env.OPENAI_MODEL_ID || 'text-davinci-003',
                prompt: txt,
                max_tokens: 2048,
                temperature: 0.7,
            });
            const result = (response.data.choices[0].text as string).toLowerCase().trim()
            console.log(response.data.choices[0].text, result)
            let category: string | any
            if (result.includes('material')) {
                category = 'material'
            } else if (result.includes('plant')) {
                category = 'plant'
            } else if (result.includes('tools')) {
                category = 'tools'
            } else if (result.includes('ppe')) {
                category = 'ppe'
            } else {
                if (result.includes('\n')) {
                    const resultArr = result.split('\n');
                    resultArr.forEach(r => {
                        if (r && r.includes(':')) {
                            category = {
                                ...category || {},
                                [r.split(':')[0].trim()]: r.split(':')[1].trim().includes(',') ? r.split(':')[1].trim().split(',').map(t => t.trim()) : [r.split(':')[1].trim()]
                            }
                        }
                    })
                }
            }
            resolve(category || 'material');
        } catch (e) {
            reject(e);
        }
    });
}