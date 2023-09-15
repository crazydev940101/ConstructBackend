import { INewsletterPayload } from "../interfaces"
import { config } from "../config/config"
import { isValidatedEmail } from "../utils";
import { Newsletter, User } from "../sqlz/models";

export const reactivate_existing = false;

export const subscribe = async (data: INewsletterPayload) => {
    if(!data.email) throw new Error('Email is requried');
    if(!isValidatedEmail(data.email)) throw new Error('Invalid email');
    if(!data.firstname) throw new Error('First Name is required')
    if(!data.lastname) throw new Error('Last Name is required')
    if(!data.company) throw new Error('Company Name is required')
    const formData = `{
        "email": "${data.email}",
        "reactivate_existing": ${reactivate_existing},
        "custom_fields": [
            {
                "name": "First Name",
                "value": "${data.firstname}"
            },
            {
                "name": "Last Name",
                "value": "${data.lastname}"
            },
            {
                "name": "Company",
                "value": "${data.company}"
            }
        ]
    }`
    const result = await fetch(`https://api.beehiiv.com/v2/publications/${config.beehiivPublicationId}/subscriptions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${config.beehiivApiKey}`,
            'Content-Type': 'application/json'
        },
        body: formData
    }).then(response => response.json())
    const user = await User.findOne({
        where: {
            email: data.email
        }
    })
    if(user) data.userId = user.id
    const newsletterData = {
        ...data,
        publicationId: config.beehiivPublicationId,
        metadata: result
    }
    const newsletter = await Newsletter.findOne({
        where: {
            publicationId: config.beehiivPublicationId,
            email: newsletterData.email
        }
    })
    if(newsletter) {
        await Newsletter.update(newsletterData, {
            where: {
                publicationId: config.beehiivPublicationId,
                email: newsletterData.email
            }
        })
    } else {
        await Newsletter.create(newsletterData)
    }
    return result
}

export const getSubscriptionList = async () => {
    const result = await fetch(`https://api.beehiiv.com/v2/publications/${config.beehiivPublicationId}/subscriptions`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${config.beehiivApiKey}`,
            'Content-Type': 'application/json'
        },
    }).then(response => response.json())
    return result
}