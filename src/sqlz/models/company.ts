import { Model, Optional, INTEGER, STRING, DATE, UUID, UUIDV4 } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { ICompany } from "../../interfaces";
import { SubscriptionPlan } from "./subscriptionPlan";

interface CompanyDetailCreationAttributes
  extends Optional<ICompany, "id"> {}

export class Company
  extends Model<ICompany, CompanyDetailCreationAttributes>
  implements ICompany
{
  public id: number;
  public longId: string;
  public name: string;
  public stripeCustomerId: string;
  public stripeSubscriptionId: string;
  public subscriptionPlanId: number;
  public stripeSubscriptionCanceledAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}

Company.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: INTEGER,
      primaryKey: true,
    },
    longId: {
      type: UUID,
      allowNull: false,
      defaultValue: UUIDV4,
      unique: true
    },
    name: {
      type: STRING,
      allowNull: false,
    },
    stripeCustomerId: {
      type: STRING,
      allowNull: true,
    },
    stripeSubscriptionId: {
      type: STRING,
      allowNull: true,
    },
    subscriptionPlanId: {
      type: INTEGER,
      allowNull: true,
    },
    stripeSubscriptionCanceledAt: {
      type: DATE,
      allowNull: true,
    },
  },
  { sequelize, tableName: TABLES.COMPANY }
);

Company.belongsTo(SubscriptionPlan, {
  foreignKey: "subscriptionPlanId",
  constraints: false,
  as: 'plan'
});

SubscriptionPlan.hasMany(Company, {
  foreignKey: "subscriptionPlanId",
  constraints: false,
  as: 'companies'
});
