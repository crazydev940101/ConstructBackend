import { ContactRequest, User } from "../sqlz/models";
import { ICreateContactRequestPayload } from "../interfaces";
import { CONTACT_TO, EMAIL_KEYS, sendMail } from "../services/mail";

export const createRequest = async (data: ICreateContactRequestPayload) => {
    const user = await User.findOne({
        where: {
            email: data.email
        }
    })
    if (user) data.userId = user.id
    const request = await ContactRequest.create({
        ...data,
        status: 'pending'
    });
    await sendMail({
        mail: EMAIL_KEYS.CONTACT_SUPPORT,
        info: {
            from: {
                name: `${user?.firstname || ''} ${user?.lastname || ''}`,
                email: data.email
            },
            to: CONTACT_TO
        },
        data: data
    })
    await sendMail({
        mail: EMAIL_KEYS.CONTACT_CONFIRM,
        info: {
            to: [data.email],
        },
    })
    return request
}