import { Model, Optional, INTEGER, STRING } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { ISubscriptionResource } from "../../interfaces/subscriptionResource";
import { SubscriptionPlan } from "./subscriptionPlan";
import { Company } from "./company";

interface SubscriptionResourceDetailCreationAttributes
  extends Optional<ISubscriptionResource, "id"> {}

export class SubscriptionResource
  extends Model<ISubscriptionResource, SubscriptionResourceDetailCreationAttributes>
  implements ISubscriptionResource
{
  public id: number;
  public subscriptionPlanId: number;
  public key: string;
  public value: number;
  public companyId: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}

SubscriptionResource.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: INTEGER,
      primaryKey: true,
    },
    subscriptionPlanId: {
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
    companyId: {
      type: INTEGER,
      allowNull: true
    }
  },
  { sequelize, tableName: TABLES.SUBSCRIPTION_RESOURCE }
);

SubscriptionResource.belongsTo(SubscriptionPlan, {
  foreignKey: "subscriptionPlanId",
  constraints: false,
  as: 'plan'
});

SubscriptionPlan.hasMany(SubscriptionResource, {
  foreignKey: "subscriptionPlanId",
  constraints: false,
  as: 'resources'
});

SubscriptionResource.belongsTo(Company, {
  foreignKey: "companyId",
  constraints: false,
  as: 'company'
});

Company.hasMany(SubscriptionResource, {
  foreignKey: "companyId",
  constraints: false,
  as: 'resources'
});
