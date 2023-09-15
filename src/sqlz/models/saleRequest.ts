import { Model, STRING, INTEGER, Optional, ENUM, TEXT } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { ISaleRequest, TSaleRequestStatus } from "../../interfaces";
import { Company } from "./company";
import { User } from "./user";
import { SubscriptionPlan } from "./subscriptionPlan";

interface SaleRequestCreationAttributes extends Optional<ISaleRequest, "id"> {}

export class SaleRequest
  extends Model<ISaleRequest, SaleRequestCreationAttributes>
  implements ISaleRequest
{
  public id!: number;
  public companyId: number;
  public userId: number;
  public description: string;
  public status: TSaleRequestStatus;
  public stripeSubscriptionId: string;
  public price: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public plan: SubscriptionPlan;
}

SaleRequest.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: INTEGER,
      allowNull: false
    },
    userId: {
      type: INTEGER,
      allowNull: false
    },
    description: {
      type: TEXT,
      allowNull: false
    },
    status: {
      type: ENUM('submitted', 'pending', 'completed', 'declined'),
      allowNull: false,
      defaultValue: 'pending'
    },
    stripeSubscriptionId: {
      type: STRING,
      allowNull: true
    },
    price: {
      type: INTEGER,
      allowNull: true
    },
  },
  { sequelize, tableName: TABLES.SALE_REQUEST }
);

SaleRequest.belongsTo(Company, {
  foreignKey: "companyId",
  constraints: false,
  as: 'company'
});

Company.hasMany(SaleRequest, {
  foreignKey: "companyId",
  constraints: false,
  as: 'saleRequest'
});

SaleRequest.belongsTo(User, {
  foreignKey: "userId",
  constraints: false,
  as: 'user'
});

User.hasMany(SaleRequest, {
  foreignKey: "userId",
  constraints: false,
  as: 'saleRequest'
});
