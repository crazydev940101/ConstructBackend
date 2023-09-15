import { classifer } from "../controllers/chatbot.controller";
import { IComposed_v45, IIDFormat, IInvoiceFormat, IReceiptFormat, TExtractDataCategory } from "../interfaces";

export const processDataByModel: {
    [key: string]: any
} = {
    'Composed_v45': async (data: any): Promise<any> => {
        if (!data.length) {
            return {};
        }
        const dataSource = data[0].fields;
        let result: IComposed_v45 = {
            supplier: null,
            deliveryDate: null,
            details: []
        }
        if (!dataSource) return {}
        if (dataSource.Supplier) {
            result.supplier = dataSource.Supplier.value
        }
        if (dataSource.Date) {
            result.deliveryDate = dataSource.Date.value
        }
        if (dataSource['Delivery Details'] && dataSource['Delivery Details'].values) {
            console.log('details => ', dataSource['Delivery Details'])
            for (let detail of dataSource['Delivery Details'].values) {
                let classifiedResult: TExtractDataCategory = 'material'
                if(detail.properties['Item no.'])
                    classifiedResult = await classifer(detail.properties['Item no.'].value)
                let d = {
                    inventory: detail.properties['Item no.'] ? detail.properties['Item no.'].value : '-',
                    quantity: detail.properties['Quantity'] ? detail.properties['Quantity'].value : null,
                    unit: detail.properties['Unit'] ? detail.properties['Unit'].value : null,
                    category: typeof classifiedResult !== 'object' ? classifiedResult : 'material'
                }
                if(classifiedResult !== 'material') {
                    delete d.unit
                }
                result.details.push(d)
            }
        }
        return result
    },
    'prebuilt-receipt': (data: any): any => {
        if (!data.documents.length) {
            return {};
        }
        const dataSource = data.documents[0].fields
        let result: IReceiptFormat = {
            date: "",
            supplier: "",
            address: "",
            item: [],
            quantity: "", // missed
            cost: "",
        }
        if (dataSource) {
            if (dataSource.Items) {
                dataSource.Items.values.forEach((v: any) => {
                    const properties = v.properties
                    let keys = Object.keys(properties)
                    let item = {}
                    keys.forEach((k: string) => {
                        item = {
                            ...item,
                            [k]: properties[k].value
                        };
                    })
                    result.item.push(item)
                })
            }
            if (dataSource.MerchantName) {
                result.supplier = dataSource.MerchantName.value
            }
            if (dataSource.TransactionDate) {
                result.date = dataSource.TransactionDate.value
            }
            if (dataSource.MerchantAddress) {
                result.address = dataSource.MerchantAddress.value
            }
            if (dataSource.Total) {
                result.cost = dataSource.Total.value
            }
            return result;
        }
        return {}
    },
    'prebuilt-invoice': (data: any): any => {
        if (!data.documents.length) {
            return {};
        }
        const dataSource = data.documents[0].fields;
        let result: IInvoiceFormat = {
            amount_due: "", // missed
            item: [],
            billing_address: "",
            customer_address: "",
            customer_name: "",
            customer_iD: "",
            due_date: "",
            invoice_date: "",
            invoice_iD: "",
            invoice_total: "",
            previous_unpaid_balance: "", // missed
            purchase_order: "",
        }
        if (dataSource) {
            if (dataSource.Items) {
                dataSource.Items.values.forEach((v: any) => {
                    const properties = v.properties
                    let keys = Object.keys(properties)
                    let item = {}
                    keys.forEach((k: string) => {
                        item = {
                            ...item,
                            [k]: properties[k].value
                        };
                    })
                    result.item.push(item)
                })
            }
            if (dataSource.BillingAddress) {
                result.billing_address = dataSource.BillingAddress.value
            }
            if (dataSource.ShippingAddress) {
                result.customer_address = dataSource.ShippingAddress.value
            }
            if (dataSource.LastName) {
                result.customer_name = dataSource.LastName.value
            }
            if (dataSource.CustomerId) {
                result.customer_iD = dataSource.CustomerId.value
            }
            if (dataSource.DueDate) {
                result.due_date = dataSource.DueDate.value
            }
            if (dataSource.InvoiceDate) {
                result.invoice_date = dataSource.InvoiceDate.value
            }
            if (dataSource.InvoiceId) {
                result.invoice_iD = dataSource.InvoiceId.value
            }
            if (dataSource.InvoiceTotal) {
                result.invoice_total = dataSource.InvoiceTotal.value
            }
            if (dataSource.PurchaseOrder) {
                result.purchase_order = dataSource.PurchaseOrder.value
            }
            return result;
        }
        return {}
    },
    'prebuilt-layout': (data: any): any => { return data },
    'prebuilt-idDocument': (data: any): any => {
        if (!data.documents.length) {
            return {};
        }
        const dataSource = data.documents[0].fields;
        let result: IIDFormat = {
            country: "",
            document_number: "",
            first_name: "",
            last_name: "",
            address: "",
            date_of_birth: "",
            date_of_expiration: "",
            date_of_issue: "",
            restrictions: "",
            vehicle_classification: "",
        }
        if (dataSource) {
            if (dataSource.CountryRegion) {
                result.country = dataSource.CountryRegion.value
            }
            if (dataSource.DocumentNumber) {
                result.document_number = dataSource.DocumentNumber.value
            }
            if (dataSource.FirstName) {
                result.first_name = dataSource.FirstName.value
            }
            if (dataSource.LastName) {
                result.last_name = dataSource.LastName.value
            }
            if (dataSource.Address) {
                result.address = dataSource.Address.value
            }
            if (dataSource.DateOfBirth) {
                result.date_of_birth = dataSource.DateOfBirth.value
            }
            if (dataSource.DateOfExpiration) {
                result.date_of_expiration = dataSource.DateOfExpiration.value
            }
            if (dataSource.DateOfIssue) {
                result.date_of_issue = dataSource.DateOfIssue.value
            }
            if (dataSource.Restrictions) {
                result.restrictions = dataSource.Restrictions.value
            }
            if (dataSource.VehicleClassifications) {
                result.vehicle_classification = dataSource.VehicleClassifications.value
            }
            return result;
        }
        return {}
    },
}