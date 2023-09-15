import { IJWTPayload } from "./jwt";

export interface ILoggedInUser extends IJWTPayload {
  sessionId: number;
}