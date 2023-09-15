export interface IResponse {
  status: number;
  data?: any;
  error?: {
    message: string;
  };
  message?: string;
}
