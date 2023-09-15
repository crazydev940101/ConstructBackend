import { Model, Optional, INTEGER, STRING, TEXT, FLOAT, ENUM } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { IDeliveryItemDetail, TExtractDataCategory } from "../../interfaces";
import { DeliveryTicket } from "./deliveryTicket";

interface DeliveryItemDetailCreationAttributes
  extends Optional<IDeliveryItemDetail, "id"> {}

export class DeliveryItem
  extends Model<IDeliveryItemDetail, DeliveryItemDetailCreationAttributes>
  implements IDeliveryItemDetail
{
  public id: number;
  public ticketId: number;
  public inventory: string | null;
  public quantity: number | null;
  public unit: string | null;
  public category: TExtractDataCategory;
  public standardUnit: string;
  public convertedQuantity: number;
  public ceFactor: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}

DeliveryItem.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: INTEGER,
      primaryKey: true,
    },
    ticketId: {
      type: INTEGER,
      allowNull: false,
    },
    inventory: {
      type: TEXT,
      allowNull: false
    },
    quantity: {
      type: FLOAT,
      allowNull: false
    },
    standardUnit: {
      type: STRING,
      allowNull: true
    },
    convertedQuantity: {
      type: FLOAT,
      allowNull: true
    },
    ceFactor: {
      type: FLOAT,
      allowNull: true
    },
    unit: {
      type: STRING,
      allowNull: true
    },
    category: {
      type: ENUM('material', 'plant', 'tools', 'ppe'),
      allowNull: false
    },
  },
  { sequelize, tableName: TABLES.DELIVERY_ITEM }
);

DeliveryItem.belongsTo(DeliveryTicket, {
  foreignKey: "ticketId",
  constraints: false,
  as: 'ticket'
});

DeliveryTicket.hasMany(DeliveryItem, {
  foreignKey: "ticketId",
  constraints: false,
  as: 'items'
});
