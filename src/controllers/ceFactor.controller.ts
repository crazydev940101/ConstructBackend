import { CEFactor } from "../sqlz/models";
import { ICEFactor, ICEFactorPayload } from "../interfaces";

export const create = async (data: ICEFactorPayload) => {
    if(!data.companyId) throw new Error(`Company is required`)
    return await CEFactor.create(data);
}

export const update = async (data: ICEFactor) => {
    const id = data.id;
    if(!id) throw new Error('Id is required');
    delete data.id;
    delete data.companyId;
    return await CEFactor.update(data, {where: {id}});
}

export const get = async (id: number) => {
    if(!id) throw new Error('Id is required');
    return await CEFactor.findByPk(id);
}

export const getAll = async () => {
    return await CEFactor.findAll();
}

export const remove = async (id: number) => {
    return await CEFactor.destroy({where: {id}});
}