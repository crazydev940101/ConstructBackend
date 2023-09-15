import { Model, Optional, INTEGER, STRING } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { ICompanySubscriptionResource } from "../../interfaces";
import { Company } from "./company";

interface CompanySubscriptionResourceDetailCreationAttributes
  extends Optional<ICompanySubscriptionResource, "id"> {}

export class CompanySubscriptionResource
  extends Model<ICompanySubscriptionResource, CompanySubscriptionResourceDetailCreationAttributes>
  implements ICompanySubscriptionResource
{
  public id: number;
  public companyId: number;
  public key: string;
  public value: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}

CompanySubscriptionResource.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: INTEGER,
      primaryKey: true,
    },
    companyId: {
      type: INTEGER,
      allowNull: false,
    },
    key: {
      type: STRING,
      allowNull: false
    },
    value: {
      type: INTEGER,
      allowNull: false
    },
  },
  { sequelize, tableName: TABLES.COMPANY_SUBSCRIPTION_RESOURCE }
);

CompanySubscriptionResource.belongsTo(Company, {
  foreignKey: "companyId",
  constraints: false,
  as: 'company'
});

Company.hasMany(CompanySubscriptionResource, {
  foreignKey: "companyId",
  constraints: false,
  as: 'companyResources'
});
