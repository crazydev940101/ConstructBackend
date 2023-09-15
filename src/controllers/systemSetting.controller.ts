import { SystemSetting } from "../sqlz/models/systemSetting";
import { ISystemSettingPayload } from "../interfaces";

export const getAll = async () => {
    return await SystemSetting.findAll();
}

export const getByKey = async (key: string) => {
    return await SystemSetting.findOne({
        where: {
            sKey: key
        }
    });
}

export const store = async (data: ISystemSettingPayload) => {
    const setting = await SystemSetting.findOne({
        where: {
            sKey: data.sKey
        }
    })
    if (!setting) {
        return await SystemSetting.create(data)
    } else {
        return await SystemSetting.update({
            sValue: data.sValue
        }, {
            where: {
                sKey: data.sKey
            }
        })
    }
}