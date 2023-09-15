import { Dialect } from "sequelize/types";

export interface IDBConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
  sslmode?: string,
  logging: boolean;
  force: boolean;
  timezone: string;
}
