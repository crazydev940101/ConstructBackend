import { ExtractData, ExtractModel, Project, CompanySubscriptionResource, User, DeliveryTicket, DeliveryItem, CEFactor, Company } from "../sqlz/models";
import ErrorType, { ERROR_MESSAGES } from "../constants/ErrorType";
import ForbiddenError from "../exceptions/ForbiddenError";
import { EUserRole, IProject, EInsightInventoryType, IDownloadParams, TInventoryType } from "../interfaces";
import { analyzeComposed_v45, analyzeOCR } from "../services/azureFormRecognizer";
import { processDataByModel } from "../services/processFormData";
import { ESUBSCRIPTION_RESOURCE_KEY } from "../constants/subscriptionResourceKey";
import { canExtract } from "../middlewares/extractDataMiddlewares";
import { deleteBlobIfItExists, getPublicLink } from "../services/azureBlob";
import { createUsageRecord, getCompanySubscription } from "./stripe.controller";
import { EMAIL_KEYS, sendMail } from "../services/mail";
import { config } from "../config/config";
import { LINKS } from "../constants/links";
import xlsx, { IJsonSheet, ISettings } from '../utils/xlsx'
import { FindOptions, Op } from "sequelize";
import { generateRandomString } from "../utils/string";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { CHATBOT_MODELS, openai } from "../services/chatbot";
import { AttachmentData } from "@sendgrid/helpers/classes/attachment";

dayjs.extend(customParseFormat);

/**
 * Insert project.
 *
 * @param {IProject} params
 * @returns {Promise<Project>}
 */
export async function create(
  params: IProject
): Promise<Project> {
  try {
    if (!params.projectName) {
      throw new Error('projectName is required');
    }
    if (!params.projectId) {
      params.projectId = params.projectName.toLowerCase()
        .trim()
        .concat('-', `${generateRandomString(6)}`)
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
    }
    const project = await Project.create({
      extractorId: params.extractorId,
      projectName: params.projectName,
      projectId: params.projectId,
      projectLocation: params.projectLocation,
      companyId: params.companyId
    });
    return project;
  } catch (error) {
    console.log(error)
    throw error;
  }
}

/**
 * Update project
 * 
 * @param {number} id 
 * @param {IProject} params 
 * @return {Promise<Project | null>}
 */
export async function update(
  id: number,
  params: IProject
): Promise<Project | null> {
  try {
    if (!params.projectId && params.projectName) {
      params.projectId = params.projectName.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '')
    }
    await Project.update({
      projectName: params.projectName,
      projectId: params.projectId,
      projectLocation: params.projectLocation
    }, {
      where: {
        id
      }
    });
    const project = await Project.findOne({ where: { id } });
    return project;
  } catch (err) {
    throw err;
  }
}

/**
 * Get project list
 *
 * @returns {Promise<Project[]>}
 */
export async function getList(): Promise<Project[]> {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: ExtractModel,
          as: 'model'
        },
        {
          model: ExtractData,
          as: 'data',
          // include: [
          //   {
          //     model: DeliveryTicket,
          //     as: 'data',
          //     include: [
          //       {
          //         model: DeliveryItem,
          //         as: 'items'
          //       }
          //     ]
          //   }
          // ]
        }
      ],
      order: ['extractorId']
    });
    return projects;
  } catch (err) {
    throw err;
  }
}

export async function getListWithCompanyId(companyId: number, userRole: string): Promise<Project[]> {
  try {
    let option: FindOptions = {
      include: [
        {
          model: ExtractModel,
          as: 'model'
        },
        {
          model: ExtractData,
          as: 'data'
        },
        ...(userRole === EUserRole.SYSTEM_ADMIN
          ? [
            {
              model: Company,
              as: 'owner',
              attributes: ['id', 'name'],
            }
          ]
          : [])
      ],
      order: ['extractorId']
    }
    if (companyId) {
      option = {
        ...option,
        where: {
          companyId
        }
      }
    }
    const projects = await Project.findAll(option);
    return projects;
  } catch (err) {
    throw err;
  }
}

/**
 * Get project detail with id
 * 
 * @param {number} id 
 * @returns {Promise<Project | null>}
 */
export async function get(id: number): Promise<Project | null> {
  try {
    const project = await Project.findOne({
      where: { id }, include: [
        {
          model: ExtractModel,
          as: 'model'
        },
        {
          model: ExtractData,
          as: 'data',
          include: [
            {
              model: DeliveryTicket,
              as: 'data',
              include: [
                {
                  model: DeliveryItem,
                  as: 'items'
                }
              ]
            }
          ]
        }
      ]
    })
    return project;
  } catch (err) {
    throw err;
  }
}

/**
 * Delete project.
 *
 * @param {number} id
 * @returns {Promise<number>}
 */
export async function remove(id: number): Promise<number> {
  try {
    const extractDataList = await ExtractData.findAll({ where: { projectId: id } });
    for (let extractData of extractDataList) {
      const tickets = await DeliveryTicket.findAll({
        where: {
          extractDataId: extractData.id
        }
      })
      for (let ti of tickets) {
        await DeliveryItem.destroy({ where: { ticketId: ti.id } })
      }
      await DeliveryTicket.destroy({ where: { extractDataId: extractData.id } })
      await deleteBlobIfItExists(extractData.blobName)
    }
    await ExtractData.destroy({
      where: {
        projectId: id
      }
    });
    const project = await Project.destroy({
      where: {
        id
      }
    })
    return project;
  } catch (err: any) {
    if (err.message === ErrorType.NO_ROWS_UPDATED_ERROR) {
      throw new ForbiddenError(err.message);
    }
    throw err;
  }
}

export const getResource = async (blobFileName: string) => {
  try {
    const resource = await ExtractData.findOne({
      where: {
        blobName: {
          [Op.like]: `%${blobFileName}`
        }
      }, include: [
        {
          model: Project,
          as: 'project',
          include: [
            {
              model: ExtractModel,
              as: 'model'
            }
          ]
        }
      ]
    })
    if (!resource) throw new Error(`Not found resource ${blobFileName}`)
    const blobLink = getPublicLink(resource?.blobName, 60)
    resource.documentLink = blobLink
    return resource;
  } catch (err) {
    throw err;
  }
}

/**
 * Extract data with project Id
 * 
 * @param {number} id
 * @param {number} companyId
 * @returns {Promise<number>}
 */
export const extract = async (id: number, companyId: number, userId: number, token: string) => {
  let counter = 0
  try {
    const project = await Project.findOne({
      where: { id }, include: [
        {
          model: ExtractModel,
          as: 'model'
        },
        {
          model: ExtractData,
          as: 'data'
        }
      ]
    })
    if (!project || !project.model) {
      throw new Error('Please check project and extract model')
    }
    if (!project.data.length) {
      throw new Error('No documents. Please upload documents');
    }
    await Project.update({ isExtracting: true }, { where: { id } })
    switch (project.model.modelId) {
      case 'Composed_v45':
        const factors = await CEFactor.findAll();
        const categoryStr = factors.map(factor => factor.material).join(', ')
        const factorStr = factors.map(factor => `${factor.material}: ${factor.factor}`).join(', ')
        for (let data of project.data) {
          if (data.extractedData) continue
          try {
            await canExtract(companyId, counter)
          } catch (err) {
            break
          }
          const document = await analyzeComposed_v45(data.blobName)
          let updatedData
          try {
            updatedData = await processDataByModel[project.model.modelId](document);
          } catch (err) {
            console.log(err);
            continue
          }
          if (updatedData) {
            counter++;
            await ExtractData.update({
              extractedData: JSON.stringify(document),
              extractedDate: new Date()
            }, {
              where: {
                id: data.id
              }
            })
            try {
              if (updatedData.deliveryDate) {
                const d = new Date(updatedData.deliveryDate)
                if (d.toString() === 'Invalid Date')
                  updatedData.deliveryDate = dayjs(updatedData.deliveryDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
              }
              if(new Date(updatedData.deliveryDate).toString() === 'Invalid Date') {
                updatedData.deliveryDate = new Date('0001-01-01')
              }
              const ticket = await DeliveryTicket.create({
                supplier: updatedData.supplier,
                deliveryDate: updatedData.deliveryDate ? new Date(updatedData.deliveryDate) : null,
                extractDataId: data.id
              })
              if (!updatedData.details) continue
              for (let item of updatedData.details) {
                if (item.category !== 'material') {
                  await DeliveryItem.create({
                    inventory: item.inventory,
                    quantity: item.quantity || 0,
                    unit: item.unit || '',
                    category: item.category,
                    ticketId: ticket.id
                  })
                  continue;
                }
                // Carbon emission factor - Start
                const response = await openai.createChatCompletion({
                  model: CHATBOT_MODELS.GPT_35_TURBO,
                  messages: [
                    {
                      role: 'system',
                      content: `Assistant helps to get carbon emission factor from the inventory's category. Below is carbon emission factors of categories of inventories. Please check if which category does inventory belong to and give me the category's carbon emission factor.
                      Categories: ${categoryStr}
                      Carbon Emission Factor: ${factorStr}
                      Please provide only the factor without category name and any description. If you are not sure, please provide 0 withgout any description.`
                    },
                    // {
                    //   role: 'user',
                    //   content: `9.90 1189 20/40 Coarse Aggregate`
                    // },
                    // {
                    //   role: 'assistant',
                    //   content: `0.103`
                    // },
                    {
                      role: 'user',
                      content: `JEWSON Granite 6mm - Dust AGSTB010 850.0000`
                    },
                    {
                      role: 'assistant',
                      content: `0.103`
                    },
                    {
                      role: 'user',
                      content: `${item.inventory}`
                    }
                  ]
                })
                const answer = response.data.choices[0].message?.content as string;
                const extractedAnswer = answer.match(/([0-9]*[.])[0-9]+/) // get float number from text
                const cf = extractedAnswer ? parseFloat(extractedAnswer[0]).toString() === 'NaN' ? 0 : parseFloat(extractedAnswer[0]) : 0
                // Carbon emission factor - End
                // Convert Unit - Start
                const completionResponse = await openai.createChatCompletion({
                  model: CHATBOT_MODELS.GPT_35_TURBO,
                  messages: [
                    {
                      role: 'system',
                      content: `Assistant helps to convert unit. 
                      Please convert the unit to kg and provide only the quantity number without the unit and any description.`
                    },
                    // {
                    //   role: 'user',
                    //   content: `9.90 1189 20/40 Coarse Aggregate`
                    // },
                    // {
                    //   role: 'assistant',
                    //   content: `0.103`
                    // },
                    {
                      role: 'user',
                      content: `2.34 TONNE`
                    },
                    {
                      role: 'assistant',
                      content: `2340`
                    },
                    {
                      role: 'user',
                      content: `${item.quantity || 0} ${item.unit || ''}`
                    }
                  ]
                })
                const unit = completionResponse.data.choices[0].message?.content as string;
                const unitSubstr = unit.match(/([0-9]*[.])[0-9]+/) // get float number from text
                const convertedQuantity = parseFloat(unitSubstr ? unitSubstr[0] : item.quantity).toString() === 'NaN' ? 0 : parseFloat(unitSubstr ? unitSubstr[0] : item.quantity)
                // Convert Unit - End
                await DeliveryItem.create({
                  inventory: item.inventory,
                  quantity: item.quantity || 0,
                  unit: item.unit || '',
                  category: item.category,
                  standardUnit: 'kg',
                  ceFactor: cf,
                  convertedQuantity: item.quantity ? (convertedQuantity || item.quantity || 0) : 0,
                  ticketId: ticket.id
                })
              }
            } catch (err) {
              console.log(err)
            }
          }
        }
        break;
      default:
        for (let data of project.data) {
          if (data.extractedData) continue
          try {
            await canExtract(companyId, counter)
          } catch (err) {
            break
          }
          const document = await analyzeOCR(project.model.modelId, data.blobName)
          let updatedData;
          try {
            updatedData = processDataByModel[project.model.modelId](document);
          } catch (err) {
            console.log(err);
            continue
          }
          if (updatedData) {
            counter++;
            await ExtractData.update({
              extractedData: JSON.stringify(updatedData),
              extractedDate: new Date()
            }, {
              where: {
                id: data.id
              }
            })
          }
        }
        break
    }

    if (counter) {
      // pay as you go - Start
      let subscription
      try {
        subscription = await getCompanySubscription(companyId)
      } catch (err) {
        if ((err as Error).message !== ERROR_MESSAGES.UNSUBSCRIBED_COMPANY) {
          throw new Error((err as Error).message)
        }
      }
      if ((subscription as any)?.plan?.transform_usage) {
        const itemId = subscription?.items.data[0]?.id
        if (itemId)
          await createUsageRecord(itemId, counter)
      }
      // pay as you go - End
      // update total number of extracted data for subscription(regular monthly subscription and enterprise - contact sale)
      const userResource = await CompanySubscriptionResource.findOne({ where: { companyId: companyId, key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS } })
      if (userResource)
        await CompanySubscriptionResource.update(
          {
            value: userResource.value + counter
          },
          {
            where: {
              companyId,
              key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS
            }
          })
      else
        await CompanySubscriptionResource.create(
          {
            companyId,
            key: ESUBSCRIPTION_RESOURCE_KEY.MAX_NUMBER_OF_DOCUMENTS,
            value: counter
          })
      const user = await User.findByPk(userId)

      let attachments: AttachmentData[] = [];
      if (project.model.modelId) {
        let response: any = '';
        if (project.model.modelId === "Composed_v45") {
          try {
            response = await download({ userId: userId, projectId: project.id, inventoryType: 'all' });
          } catch (err) {
            console.log('Error in building xlsx file: ', err)
          }
          // } else if (project.model.modelId.includes("prebuilt")) {
          //   response = await download({ userId: userId, projectId: project.id });
        }
        if (response.buffer) {
          const content = response.buffer.toString('base64');
          const filename = response.filename;

          attachments = [{
            filename,
            content,
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            disposition: 'attachment',
          }];
        }
      }

      if (user) {
        sendMail({
          mail: EMAIL_KEYS.EXTRACTION_READY,
          info: {
            to: [user.email],
            attachments,
          },
          data: {
            // downloadLink: project.model.modelId === 'Composed_v45' ? `${config.host}/api/v1/project/download/insight/all/${project.id}?token=${token.replace('Bearer ', '')}` : '',
            extractionPageLink: `${config.frontend}/app/extractions/${id}?modelId=${project.extractorId}&tab=0&modelName=${project.model.extractorName}`,
            newExtractionPageLink: `${config.frontend}/app/new-extraction`,
            meetingLink: LINKS.AIRDOC_PRO_CALL,
            newsletterLink: `${config.frontend}/newsletter`
          }
        })
      }
    }
    await Project.update({ isExtracting: false, extractedAt: new Date() }, { where: { id } })
    return {
      status: 200,
      data: 'success'
    }
  } catch (err) {
    await Project.update({ isExtracting: false, extractedAt: new Date() }, { where: { id } })
    console.log(err)
    throw err;
  }
}

export const download = async (args: IDownloadParams) => {
  console.log(args)
  let extractedData, fileName

  // Check can download(project || extractData)
  if (!args.projectId && !args.extractDataId)
    throw new Error('Project ID or Extracted Data ID should be ready to download result')

  // Check can download(owner)
  if (!args.userId)
    throw new Error('Only owner can download the extracted result')

  // Check file type
  let fileType = args.fileType;
  if (!fileType)
    fileType = 'xlsx';

  // Check owner
  const owner = await User.findByPk(args.userId);
  if (!owner)
    throw new Error('Only owner can download the extracted result')

  if (args.projectId) {
    const project = await Project.findByPk(args.projectId, {
      include: [
        {
          model: ExtractModel,
          as: 'model'
        },
        {
          model: ExtractData,
          as: 'data',
          where: {
            extractedDate: {
              [Op.not]: null
            }
          },
          include: [
            {
              model: DeliveryTicket,
              as: 'data',
              include: [
                {
                  model: DeliveryItem,
                  as: 'items'
                }
              ]
            }
          ]
        }
      ]
    })
    if (!project) throw new Error(`Project #${args.projectId} is not exist`)
    if (owner.role !== EUserRole.SYSTEM_ADMIN) {
      if (owner.companyId !== project.companyId) throw new Error('Only owner can download the extracted result')
    }
    if (project.model.modelId === "Composed_v45") {
      extractedData = project.data.map(d => d.data)
    } else if (project.model.modelId.includes("prebuilt")) {
      extractedData = project.data.map(d => JSON.parse(d.extractedData))
    }
    fileName = project.projectName
  }
  if (args.extractDataId) {
    const data = await ExtractData.findByPk(args.extractDataId, {
      include: [
        {
          model: Project,
          as: 'project'
        }
      ],
    })
    if (!data) throw new Error(`ExtractData #${args.extractDataId} is not exist`)
    if (!data.extractedData) throw new Error(`ExtractData #${args.extractDataId} was not extracted yet`)
    if (owner.role !== EUserRole.SYSTEM_ADMIN) {
      if (owner.companyId !== data.project.companyId) throw new Error('Only owner can download the extracted result')
    }
    extractedData = [JSON.parse(data.extractedData)]
    fileName = data.documentName
  }
  if (!extractedData || !extractedData.length) throw new Error('Extracted Data is not exist')
  let jsonSheets: IJsonSheet[] = []
  if (args.inventoryType) {
    // download supplier of a deliery ticket project
    if (args.inventoryType === 'supplier') {
      jsonSheets.push({
        sheet: 'Suppliers',
        columns: [
          {
            label: 'Supplier Name',
            value: 'supplier'
          },
          {
            label: 'Delivery Date',
            value: 'deliveryDate'
          }
        ],
        content: extractedData.filter(d => !!d).map(d => {
          return {
            supplier: d.supplier,
            deliveryDate: d.deliveryDate
          }
        })
      })
    } else {
      let details: any[] = []
      for (let d of extractedData) {
        if (d)
          details = [
            ...details,
            ...d.items
          ]
      }
      const inventoryLabels = {
        material: 'Material',
        plant: 'Plant',
        tools: 'Tools',
        ppe: 'PPE'
      }
      // download all insights of a delivery ticket project
      for (let t of Object.values(EInsightInventoryType)) {
        if (details.filter(d => d.category === t).length) {
          const jsonSheet = {
            sheet: inventoryLabels[t],
            columns: [
              {
                label: `${inventoryLabels[t]} Inventory`,
                value: 'inventory'
              },
              {
                label: 'Quantity',
                value: 'quantity'
              }
            ],
            content: details.filter(d => d.category === t).map(d => {
              delete d.category;
              return d
            })
          }
          if (t === EInsightInventoryType.MATERIAL) {
            jsonSheet.columns.push({
              label: 'Unit',
              value: 'unit'
            })
          }
          jsonSheets.push(jsonSheet)
        }
      }
      // download insight of specific category of a delivery ticket project
      if (args.inventoryType !== 'all') {
        jsonSheets = jsonSheets.filter(s => s.sheet === inventoryLabels[args.inventoryType as TInventoryType])
      }
    }
  } else {
    console.log(extractedData)
  }
  const xlsxSettings: ISettings = {
    writeOptions: {
      type: "buffer",
      bookType: "xlsx",
    },
  }
  const buffer = xlsx(jsonSheets, xlsxSettings)
  return {
    buffer,
    filename: `${fileName}.${fileType}`
  }
}