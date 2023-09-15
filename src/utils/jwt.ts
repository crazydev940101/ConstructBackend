import jwbt from "jsonwebtoken";
import * as crypto from "crypto";

import { config } from "../config/config";
import { IJWTPayload } from "../interfaces/jwt";
import { ILoggedInUser } from "../interfaces/loggedInUser";

const {
  accessTokenDuration,
  accessTokenSecretKey,
  refreshTokenDuration,
  refreshTokenSecretKey,
} = config;

export function generateAccessToken(data: ILoggedInUser): string {
  return jwbt.sign({ data }, accessTokenSecretKey, {
    expiresIn: accessTokenDuration,
  });
}

export function generateRefreshToken(data: IJWTPayload): string {
  return jwbt.sign({ data }, refreshTokenSecretKey, {
    expiresIn: refreshTokenDuration,
  });
}

export function verifyAccessToken(token: string): object | string {
  return jwbt.verify(token, accessTokenSecretKey);
}

export function verifyRefreshToken(token: string): object | string {
  return jwbt.verify(token, refreshTokenSecretKey);
}

export const generateToken = () => {
  return new Promise<string>((resolve, reject) => {
    crypto.randomBytes(64, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf.toString("hex"));
      }
    });
  });
};
