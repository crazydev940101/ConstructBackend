import { Company, DeliveryItem, DeliveryTicket, ExtractData, Project } from "../sqlz/models";
import ErrorType from "../constants/ErrorType";
import ForbiddenError from "../exceptions/ForbiddenError";
import { IExtractData } from "../interfaces";
import { FileArray, UploadedFile } from "express-fileupload";
import { deleteBlobIfItExists, downloadFile, uploadFile } from "../services/azureBlob";
import { Response } from "express";
import fs from "fs";
import path from 'path';

export function getPrefixFromCompany(company: Company) {
  return `${company.longId}_${company.id}_`
}

export function addCompanyPrefix(company: Company, str: string) {
  return `${getPrefixFromCompany(company)}${str}`;
}

/**
 * Insert extract data.
 *
 * @param {FileArray} documents
 * @param {number} projectId
 * @returns {Promise<ExtractData[]>}
 */
export async function create(
  documents: FileArray,
  projectId: number
): Promise<ExtractData[]> {
  try {
    const data: IExtractData[] = [];
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: Company,
          as: 'owner'
        }
      ]
    });
    if (!project) throw new Error(`Project ${projectId} is not exist.`)
    for (let fileIdx of Object.keys(documents)) {
      const documentName: string = (documents[fileIdx] as UploadedFile).name;
      const fileName: string[] = documentName.split('.');
      (documents[fileIdx] as UploadedFile).name = addCompanyPrefix(project.owner, fileName[0]);
      let documentExtension: string = fileName[fileName.length - 1]
      const { blobName, url: documentLink } = await uploadFile(documents[fileIdx], `${project.owner.longId}_${project.companyId}`)
      data.push({
        projectId,
        blobName,
        documentLink,
        documentName,
        documentExtension
      })
    }
    const extractData = await ExtractData.bulkCreate(data);
    return extractData;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

/**
 * Get extract data list
 *
 * @returns {Promise<ExtractData[]>}
 */
export async function getList(): Promise<ExtractData[]> {
  try {
    const extractData = await ExtractData.findAll();
    return extractData;
  } catch (err) {
    throw err;
  }
}

/**
 * Get extract data detail with id
 * 
 * @param {number} id 
 * @returns {Promise<ExtractData | null>}
 */
export async function get(id: number): Promise<ExtractData | null> {
  try {
    const extractData = await ExtractData.findOne({ where: { id } })
    return extractData;
  } catch (err) {
    throw err;
  }
}

/**
 * Delete extract data.
 *
 * @param {number} id
 * @returns {Promise<number>}
 */
export async function remove(id: number): Promise<number> {
  try {
    const extractData = await ExtractData.findOne({ where: { id } });
    if (!extractData) {
      throw new Error('Extract data is not exist')
    }
    const tickets = await DeliveryTicket.findAll({
      where: {
        extractDataId: extractData.id
      }
    })
    for(let ti of tickets) {
      await DeliveryItem.destroy({where: {ticketId: ti.id}})
    }
    await DeliveryTicket.destroy({where: {extractDataId: extractData.id}})
    await deleteBlobIfItExists(extractData.blobName)
    const result = await ExtractData.destroy({
      where: {
        id
      }
    })
    return result;
  } catch (err: any) {
    if (err.message === ErrorType.NO_ROWS_UPDATED_ERROR) {
      throw new ForbiddenError(err.message);
    }
    throw err;
  }
}

export async function download(id: number, res: Response) {
  try {
    const extractData = await ExtractData.findOne({ where: { id } });
    if (!extractData) throw new Error('Extract data is not exist')
    await downloadFile(extractData.blobName, res)
  } catch (err) {
    throw err;
  }
}

export const downloadToJson = async (id: number, res: Response) => {
  try {
    const extractData = await ExtractData.findOne({
      where: { id },
      attributes: ['id', 'extractedData']
    });
    if (!extractData) {
      throw new Error('Extract data does not exist');
    }

    const jsonData = extractData.extractedData;
    const filename = "data.json";

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache'); // Disable caching for the download endpoint
    res.setHeader('Cache-Control', 'no-store'); // Disable caching for the download endpoint
    
    res.status(200).send(jsonData);
  } catch (err) {
    throw err;
  }
};
