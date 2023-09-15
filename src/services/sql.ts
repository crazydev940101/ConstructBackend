export const buildSQL = (params: any, companyId: number): string | null => {
    let query: string | null = ''
    // get_projects, get_deliveries_count, get_delivery_items, and others
    let where = `"companyId" = ${companyId}`
    switch (params.action) {
        case 'get_project_list':
            /**"sort_by": "createdAt",
                    "sort_direction": "desc",
                    "time_period": "3 months",
                    "end_time": "now" */
            if (params.start_time) {
                where = `${where} AND "createdAt" >= '${params.start_time}'`
            }
            if (params.end_time) {
                where = `${where} AND "createdAt" <= '${params.end_time}'`
            }
            if (params.time_period) {
                where = `${where} AND "createdAt" >= NOW() - INTERVAL '${params.time_period}'`
            }
            query = `SELECT "id", "projectName", "createdAt" FROM "project" WHERE ${where};`;
            break;
        case 'get_deliveries_count':
            if (params.supplier) {
                where = `${where} AND dt.supplier LIKE '%Breedon%'`
            }
            query = `SELECT COUNT(*) as delivery_count FROM "deliveryTicket" dt JOIN "extractData" ed ON dt."extractDataId" = ed.id JOIN project p ON ed."projectId" = p.id WHERE p.${where}`;
            break;
        case 'get_delivery_items':
            if (params.sort_by === 'count_delivery_items'
                || params.sort_by?.includes('count')
                || params.sort_by === 'weight'
                || params.sort_by === 'date') {
                if (params.start_time) {
                    where = `${where} AND p."createdAt" >= '${params.start_time}'`
                }
                if (params.end_time) {
                    where = `${where} AND p."createdAt" <= '${params.end_time}'`
                }
                if (params.time_period) {
                    where = `${where} AND p."createdAt" >= NOW() - INTERVAL '${params.time_period}'`
                }
                if (params.delivery_item)
                    if (params.delivery_item.includes(',')) {
                        query = params.delivery_item.split(',').map((item: string) => `(SELECT inventory, '${item.trim()}' as category, SUM(quantity) AS total_quantity FROM "deliveryItem" di JOIN "deliveryTicket" dt ON di."ticketId" = dt.id AND di.category = '${item.trim()}' JOIN "extractData" ed ON dt."extractDataId" = ed.id JOIN project p ON ed."projectId" = p.id WHERE p.${where} GROUP BY inventory ORDER BY total_quantity ${params.sort_direction})`).join(' UNION ')
                    } else {
                        let l = ''
                        if (params.limit) {
                            l = `LIMIT ${params.limit || 1}`
                        }
                        query = `SELECT inventory, SUM(quantity) AS total_quantity FROM "deliveryItem" di JOIN "deliveryTicket" dt ON di."ticketId" = dt.id AND di.category = '${params.delivery_item}' JOIN "extractData" ed ON dt."extractDataId" = ed.id JOIN project p ON ed."projectId" = p.id WHERE p.${where} GROUP BY inventory ORDER BY total_quantity ${params.sort_direction || 'desc'} ${l};`;
                    }
            }
            if (params.sort_by === 'carbon_emissions')
                query = ``
            if (params.sort_by === 'category')
                query = ``
            break;
        case 'get_projects':
            query = `SELECT p."projectName", SUM(di.quantity) as amount FROM project p JOIN "extractData" ed ON p.id = ed."projectId" JOIN "deliveryTicket" dt ON ed."id" = dt."extractDataId" JOIN "deliveryItem" di ON dt.id = di."ticketId" WHERE p.${where} AND di.inventory LIKE '%${params.delivery_item}%' GROUP BY p."projectName" ORDER BY amount ${params.sort_direction} LIMIT ${params.limit || 1}`
            break;
        case 'get_suppliers':
            if (params.start_time) {
                where = `${where} AND p."createdAt" >= '${params.start_time}'`
            }
            if (params.end_time) {
                where = `${where} AND p."createdAt" <= '${params.end_time}'`
            }
            if (params.time_period) {
                where = `${where} AND p."createdAt" >= NOW() - INTERVAL '${params.time_period}'`
            }
            query = `SELECT supplier, COUNT(*) AS total_count FROM "deliveryTicket" dt JOIN "extractData" ed ON ed."id" = dt."extractDataId" JOIN project p ON p."id" = ed."projectId" WHERE p.${where} GROUP BY supplier ORDER BY total_count ${params.sort_direction} LIMIT ${params.limit || 10};`;
            break;
        case 'others':
            query = null;
            break;
        default:
            query = null;
            break;
    }
    return query;
}