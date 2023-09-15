export interface ISessionDetailPayload {
  id: number;
  token: string;
  userId: number;
  isActive: boolean;
  updatedBy?: string;
  createdBy?: string;
}
