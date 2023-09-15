import { ExtractModel } from "../sqlz/models";
import ErrorType from "../constants/ErrorType";
import ForbiddenError from "../exceptions/ForbiddenError";
import { IExtractModel } from "../interfaces";

/**
 * Insert extract model.
 *
 * @param {IExtractModel} params
 * @returns {Promise<ExtractModel>}
 */
export async function create(
  params: IExtractModel
): Promise<ExtractModel> {
  try {
    const extractModel = await ExtractModel.create({
      modelId: params.modelId,
      modelDescription: params.modelDescription,
      appVersion: params.appVersion,
      extractorName: params.extractorName,
      extractorDescription: params.extractorDescription,
      enabled: true
    });
    return extractModel;
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

/**
 * Update extract model
 * 
 * @param {number} id 
 * @param {IExtractModel} params 
 * @return {Promise<ExtractModel | null>}
 */
export async function update(
  id: number,
  params: IExtractModel
): Promise<ExtractModel | null> {
  try {
    await ExtractModel.update({
      modelId: params.modelId,
      modelDescription: params.modelDescription,
      appVersion: params.appVersion,
      extractorName: params.extractorName,
      extractorDescription: params.extractorDescription
    }, {
      where: {
        id
      }
    });
    const extractModel = await ExtractModel.findOne({ where: { id } });
    return extractModel;
  } catch(err) {
    throw err;
  }
}

/**
 * Enable/Disable extract model
 * 
 * @param {number} id 
 * @param {boolean} status 
 * @return {Promise<ExtractModel | null>}
 */
export async function updateStatus(
  id: number,
  status: boolean
): Promise<ExtractModel | null> {
  try {
    await ExtractModel.update({
      enabled: status
    }, {
      where: {
        id
      }
    });
    const extractModel = await ExtractModel.findOne({ where: { id } });
    return extractModel;
  } catch(err) {
    throw err;
  }
}

/**
 * Get extract model list
 *
 * @returns {Promise<ExtractModel[]>}
 */
export async function getAll(): Promise<ExtractModel[]> {
  try {
    const extractModels = await ExtractModel.findAll();
    return extractModels;
  } catch (err) {
    throw err;
  }
}

/**
 * Get enabled extract model list
 *
 * @returns {Promise<ExtractModel[]>}
 */
export async function getList(): Promise<ExtractModel[]> {
  try {
    const extractModels = await ExtractModel.findAll({where:{enabled:true}, order: ['id']});
    return extractModels;
  } catch (err) {
    throw err;
  }
}

/**
 * Get extractor detail with id
 * 
 * @param {number} id 
 * @returns {Promise<ExtractModel | null>}
 */
export async function get(id: number): Promise<ExtractModel | null> {
  try {
    const extractModel = await ExtractModel.findOne({ where: { id } })
    return extractModel;
  } catch (err) {
    throw err;
  }
}

/**
 * Delete extract model.
 *
 * @param {number} id
 * @returns {Promise<number>}
 */
export async function remove(id: number): Promise<number> {
  try {
    const extractModel = await ExtractModel.destroy({
      where: {
        id
      }
    })
    return extractModel;
  } catch (err: any) {
    if (err.message === ErrorType.NO_ROWS_UPDATED_ERROR) {
      throw new ForbiddenError(err.message);
    }
    throw err;
  }
}
