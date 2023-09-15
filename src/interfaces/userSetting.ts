export interface IUserSetting {
    id: number;
    userId: number;
    key: string;
    value: string;
}

export enum EUserSettingKeys {
    EMAIL_NOTIFICATION = 'email-notification'
}

export enum EUserSettingEmailNotificationOptions {
    ACTIVE = 'active',
    DISABLED = 'disabled'
}