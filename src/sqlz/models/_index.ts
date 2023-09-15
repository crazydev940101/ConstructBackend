import { Sequelize } from "sequelize";
import { IDBConfig } from "../../interfaces/dbConfig";
import databaseConfig from '../config/config.json';
import {config} from '../../config/config';

const env: 'production' | 'development' = config.env === 'production' ? 'production' : 'development'

const dbConfig: IDBConfig = databaseConfig[env] as IDBConfig;

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

export default sequelize;
