import { Model, Optional, INTEGER, STRING, DATE, BOOLEAN } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { IProjectDetail } from "../../interfaces";
import { ExtractModel } from "./extractModel";
import { ExtractData } from "./extractData";
import { Company } from "./company";

interface ProjectCreationAttributes
  extends Optional<IProjectDetail, "id"> { }

export class Project
  extends Model<IProjectDetail, ProjectCreationAttributes>
  implements IProjectDetail {
  public id: number;
  public extractorId: number;
  public projectName: string;
  public projectId: string;
  public projectLocation: string;
  public companyId: number;
  public isExtracting: boolean;
  public extractedAt: Date;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  model: ExtractModel;
  data: ExtractData[];
  owner: Company;
}

Project.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: INTEGER,
      primaryKey: true,
    },
    extractorId: {
      type: INTEGER,
      allowNull: false
    },
    projectName: {
      type: STRING,
      unique: true,
      allowNull: false,
    },
    projectId: {
      type: STRING,
      unique: true,
      allowNull: false,
    },
    projectLocation: {
      type: STRING,
      allowNull: true
    },
    companyId: {
      type: INTEGER,
      allowNull: false
    },
    isExtracting: {
      type: BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    extractedAt: {
      type: DATE,
      allowNull: true,
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
  { sequelize, tableName: TABLES.PROJECT }
);

Project.belongsTo(ExtractModel, {
  foreignKey: "extractorId",
  constraints: false,
  as: 'model'
});

ExtractModel.hasMany(Project, {
  foreignKey: "extractorId",
  constraints: false,
  as: 'projects'
});

Project.belongsTo(Company, {
  foreignKey: "companyId",
  constraints: false,
  as: 'owner'
});

Company.hasMany(Project, {
  foreignKey: "companyId",
  constraints: false,
  as: 'projects'
});
