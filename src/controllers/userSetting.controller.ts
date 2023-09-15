import { UserSetting } from "../sqlz/models";
import { EUserSettingEmailNotificationOptions, EUserSettingKeys } from "../interfaces";

export async function fetchNotificationSetting(userId: number) {
  let setting = await UserSetting.findOne({
    where: {
      userId,
      key: EUserSettingKeys.EMAIL_NOTIFICATION
    }
  })
  if (!setting) {
    setting = await UserSetting.create({
      userId,
      key: EUserSettingKeys.EMAIL_NOTIFICATION,
      value: EUserSettingEmailNotificationOptions.ACTIVE
    })
  }
  return setting;
}
export async function notificationSetting(userId: number, value: EUserSettingEmailNotificationOptions) {
  let setting = await UserSetting.findOne({
    where: {
      userId,
      key: EUserSettingKeys.EMAIL_NOTIFICATION
    }
  })
  if (!setting) {
    setting = await UserSetting.create({
      userId,
      key: EUserSettingKeys.EMAIL_NOTIFICATION,
      value: value
    })
  } else {
    await UserSetting.update({
      value
    }, {
      where: {
        userId,
        key: EUserSettingKeys.EMAIL_NOTIFICATION
      }
    })
    setting = await UserSetting.findOne({
      where: {
        userId,
        key: EUserSettingKeys.EMAIL_NOTIFICATION
      }
    })
  }
  return setting;
}