import { Model, Optional, INTEGER, TEXT, STRING, DATE } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { IExtractDataDetail } from "../../interfaces";
import { Project } from "./project";
import { DeliveryTicket } from "./deliveryTicket";

interface ExtractDataCreationAttributes
  extends Optional<IExtractDataDetail, "id"> { }

export class ExtractData
  extends Model<IExtractDataDetail, ExtractDataCreationAttributes>
  implements IExtractDataDetail {
  public id: number;
  public projectId: number;
  public blobName: string;
  public documentLink: string;
  public documentName: string;
  public documentExtension: string;
  public extractedData: any;
  public extractedDate: Date;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public project: Project;
  public data: DeliveryTicket;
}

ExtractData.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: INTEGER,
      primaryKey: true,
    },
    projectId: {
      type: INTEGER,
      allowNull: false
    },
    blobName: {
      type: STRING,
      allowNull: false,
    },
    documentLink: {
      type: TEXT,
      allowNull: false,
    },
    documentName: {
      type: STRING,
      allowNull: false,
    },
    documentExtension: {
      type: STRING,
      allowNull: false, 
    },
    extractedData: {
      type: TEXT,
      allowNull: true
    },
    extractedDate: {
      type: DATE,
      allowNull: true 
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
  { sequelize, tableName: TABLES.EXTRACT_DATA }
);

ExtractData.belongsTo(Project, {
  foreignKey: "projectId",
  constraints: false,
  as: 'project'
});

Project.hasMany(ExtractData, {
  foreignKey: "projectId",
  constraints: false,
  as: 'data'
});
