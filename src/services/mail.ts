import sendgridMail from '@sendgrid/mail';
import { config } from '../config/config';
import ejs from 'ejs'
import path from 'path';
import { User, UserSetting } from '../sqlz/models';
import { Op } from 'sequelize';
import { EUserRole, EUserSettingEmailNotificationOptions, EUserSettingKeys } from '../interfaces';
import { mailTemplates } from '../constants/emails';

export { EMAIL_KEYS } from '../constants/emails'

export const CONTACT_TO = ['vincent@hypervine.io', 'paul@hypervine.io']

sendgridMail.setApiKey(config.sendgridApiKey);

const buildMailPage = (emailPath: string, data?: any | null): Promise<string> => {
  if(!data) data = {}
  return new Promise((resolve, reject) => {ejs.renderFile(
    path.join(__dirname, emailPath),
    data,
    (err, data) => {
      if(err) {
        reject(err)
      } else {
        resolve(data)
      }
    }
  )});
}

export const sendMail = async ({ mail, info, data }: {
  mail: string,
  info: any
  data?: any | null
}) => {
  let mailInfo = {
    ...mailTemplates[mail],
  }
  if (info) {
    mailInfo = {
      ...mailInfo,
      ...info
    }
  }
  if(typeof mailInfo.from == 'string') {
    mailInfo.from = {
      name: 'Airdoc Pro',
      email: mailInfo.from
    }
  }
  if (!Array.isArray(mailInfo.to)) throw new Error('<to> should be array');
  try {
    // confirm email setting of user - start
    if(!mailInfo.to.length) throw new Error('<to> should be array of email address')
    const users = await User.findAll({
      where:{
        email:{
          [Op.in]: mailInfo.to
        }
      },
      include: [
        {
          model: UserSetting,
          as: 'settings'
        }
      ]
    })
    const to = []
    for(let user of users) {
      if(user.role === EUserRole.SYSTEM_ADMIN) {
        to.push(user.email);
        continue
      }
      if(!user.settings.length) {
        to.push(user.email)
      } else {
        let settings = user.settings.filter(st => st.key === EUserSettingKeys.EMAIL_NOTIFICATION)
        if(!settings.length) {
          to.push(user.email)
        } else {
          if(settings[0].value === EUserSettingEmailNotificationOptions.ACTIVE) {
            to.push(user.email)
          }
        }
      }
    }
    if(!to.length) return
    // confirm email setting of user - end
    const result = await sendgridMail.sendMultiple({
      to: to,
      from: mailInfo.from,
      subject: mailInfo.subject,
      content: [
        {
          type: 'text/html',
          value: await buildMailPage(mailInfo.path, data)
        }
      ],
      attachments: mailInfo.attachments
    });
    return result;
  } catch (error) {
    console.log(error)
    throw error;
  }
}

export default { sendgridMail, buildMailPage }