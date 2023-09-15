import { Company, User } from "../sqlz/models"
import { searchDocumentsWithPrefix } from "../services/azureSearch"
import { getPrefixFromCompany } from "./extractData.controller";
import { getResource } from "./project.controller";

export const search = async (txt: string, userId: number, resourceName: string | null) => {
    let prefix: string = ''
    let resource
    if (resourceName) {
        resource = await getResource(resourceName)
        prefix = resourceName;
    } else {
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: Company,
                    as: 'company'
                }
            ]
        });
        if (!user) throw new Error('Unregistered User');
        prefix = getPrefixFromCompany(user.company)
    }
    let result: any = await searchDocumentsWithPrefix(txt, prefix, !!resourceName)
    if(resourceName) result = result.data.shift() || {}
    return { ...result, resource }
}