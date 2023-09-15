import { Model, Optional, INTEGER, STRING } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { ISubscriptionPlan } from "../../interfaces/subscriptionPlan";

interface SubscriptionDetailCreationAttributes
  extends Optional<ISubscriptionPlan, "id"> {}

export class SubscriptionPlan
  extends Model<ISubscriptionPlan, SubscriptionDetailCreationAttributes>
  implements ISubscriptionPlan
{
  public id: number;
  public stripeProductId: string;
  public stripePriceId: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}

SubscriptionPlan.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: INTEGER,
      primaryKey: true,
    },
    stripeProductId: {
      type: STRING,
      allowNull: false,
    },
    stripePriceId: {
      type: STRING,
      allowNull: true,
    },
  },
  { sequelize, tableName: TABLES.SUBSCRIPTION_PLAN }
);
