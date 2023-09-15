export enum EMAIL_KEYS {
	FORGOT_PWD = 'forgotPwd',
	EXTRACTION_READY = 'extractionReady',
	INVOICE = 'invoice',
	VALIDATE_EMAIL = 'validateEmail',
	CUSTOM_SUBSCRIPTION = 'customSubscription',
	CONTACT_SUPPORT = 'contactSupport',
	CONTACT_CONFIRM = 'contactConfirm',
}

export interface EmailData {
	name: string;
	email: string;
}

export const mailTemplates: {
	[key: string]: {
		id: string;
		to: string[];
		path: string;
		from: string | EmailData;
		subject: string;
		attachments?: any[];
	}
} = {
	forgotPwd: {
		id: 'Forgot password',
		to: [''],
		from: 'noreply@hypervine.io',
		subject: 'Reset Password',
		path: '../views/emails/forgotPwd.ejs'
	},
	extractionReady: {
		id: 'Extraction is Ready',
		to: [''],
		from: 'noreply@hypervine.io',
		subject: 'Extraction is Ready',
		path: '../views/emails/extractionReady.ejs'
	},
	invoice: {
		id: 'Airdoc.Pro Invoice',
		to: [''],
		from: 'noreply@hypervine.io',
		subject: 'Airdoc.Pro Invoice',
		path: '../views/emails/invoice.ejs'
	},
	validateEmail: {
		id: 'Validate Your Email',
		to: [''],
		from: 'noreply@hypervine.io',
		subject: 'Validate Your Email',
		path: '../views/emails/validateEmail.ejs'
	},
	customSubscription: {
		id: 'Enterprise Subscription',
		to: [''],
		from: 'noreply@hypervine.io',
		subject: 'Enterprise Subscription',
		path: '../views/emails/customSubscription.ejs'
	},
	contactSupport: {
		id: 'Support Contact',
		to: [''],
		from: '',
		subject: 'Support Contact',
		path: '../views/emails/contactSupport.ejs'
	},
	contactConfirm: {
		id: 'Contact Confirm',
		to: [''],
		from: 'noreply@hypervine.io',
		subject: 'Contact Confirm',
		path: '../views/emails/contactConfirm.ejs'
	},
}
