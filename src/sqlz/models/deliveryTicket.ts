import { Model, Optional, INTEGER, DATE, TEXT } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { IDeliveryTicketDetail } from "../../interfaces";
import { ExtractData } from "./extractData";

interface DeliveryTicketCreationAttributes
  extends Optional<IDeliveryTicketDetail, "id"> {}

export class DeliveryTicket
  extends Model<IDeliveryTicketDetail, DeliveryTicketCreationAttributes>
  implements IDeliveryTicketDetail
{
  public id: number;
  public extractDataId: number;
  public supplier: string | null;
  public deliveryDate: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public extractData: ExtractData;
}

DeliveryTicket.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: INTEGER,
      primaryKey: true,
    },
    extractDataId: {
      type: INTEGER,
      allowNull: false,
    },
    supplier: {
      type: TEXT,
      allowNull: true
    },
    deliveryDate: {
      type: DATE,
      allowNull: true
    },
  },
  { sequelize, tableName: TABLES.DELIVERY_TICKET }
);

DeliveryTicket.belongsTo(ExtractData, {
  foreignKey: "extractDataId",
  constraints: false,
  as: 'extractData'
});

ExtractData.hasOne(DeliveryTicket, {
  foreignKey: "extractDataId",
  constraints: false,
  as: 'data'
});
