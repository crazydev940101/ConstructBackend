export enum EUserRole {
  SYSTEM_ADMIN = 'systemAdmin',
  SUPER_ADMIN = 'superAdmin',
  ADMIN = 'admin',
  CONTRIBUTOR = 'contributor',
  VIEWER = 'viewer',
}

export enum EUserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DECLINED = 'declined'
}

export interface IUserBasicPayload {
  firstname?: string;
  lastname?: string;
  jobTitle?: string;
  role?: EUserRole;
  email: string;
  password: string;
  companyId?: number;
  stripeCustomerId?: string;
  status?: EUserStatus;
}
export interface IUserPayload extends IUserBasicPayload {
  id?: number;
}

export interface INewUser {
  email: string;
  role: EUserRole;
  companyId: number;
}