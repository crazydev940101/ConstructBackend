export interface ISystemSettingPayload {
    sKey: string;
    sValue: string;
    description: string;
}

export interface ISystemSetting extends ISystemSettingPayload {
    id: number;
}