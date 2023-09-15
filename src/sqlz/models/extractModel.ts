import { Model, Optional, INTEGER, TEXT, STRING, DATE, BOOLEAN } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { IExtractModelDetail } from "../../interfaces";

interface ExtractModelCreationAttributes
  extends Optional<IExtractModelDetail, "id"> { }

export class ExtractModel
  extends Model<IExtractModelDetail, ExtractModelCreationAttributes>
  implements IExtractModelDetail {
  public id: number;
  public modelId: string;
  public modelDescription: string;
  public appVersion: string;
  public extractorName: string;
  public extractorDescription: string;
  public enabled: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}

ExtractModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: INTEGER,
      primaryKey: true,
    },
    modelId: {
      type: STRING,
      unique: false,
      allowNull: false
    },
    modelDescription: {
      type: TEXT,
      allowNull: false
    },
    appVersion: {
      type: DATE,
      allowNull: false
    },
    extractorName: {
      type: STRING,
      unique: true,
      allowNull: false
    },
    extractorDescription: {
      type: TEXT,
      allowNull: false
    },
    enabled: {
      type: BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    createdAt: {
      type: DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DATE,
      allowNull: false,
    }
  },
  { sequelize, tableName: TABLES.EXTRACT_MODEL }
);
