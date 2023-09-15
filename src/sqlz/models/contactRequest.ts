import { Model, STRING, INTEGER, Optional, ENUM, TEXT } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { IContactRequest, TContactRequestStatus } from "../../interfaces";
import { User } from "./user";

interface ContactRequestCreationAttributes extends Optional<IContactRequest, "id"> {}

export class ContactRequest
  extends Model<IContactRequest, ContactRequestCreationAttributes>
  implements IContactRequest
{
  public id!: number;
  public userId: number;
  public name: string;
  public email: string;
  public company: string;
  public description: string;
  public status: TContactRequestStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

}

ContactRequest.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: INTEGER,
      allowNull: false
    },
    name: {
      type: STRING,
      allowNull: false
    },
    email: {
      type: STRING,
      allowNull: false
    },
    company: {
      type: STRING,
      allowNull: false
    },
    description: {
      type: TEXT,
      allowNull: false
    },
    status: {
      type: ENUM('pending', 'completed', 'declined'),
      allowNull: false,
      defaultValue: 'pending'
    },
  },
  { sequelize, tableName: TABLES.CONTACT_REQUEST }
);

ContactRequest.belongsTo(User, {
  foreignKey: "userId",
  constraints: false,
  as: 'user'
});

User.hasMany(ContactRequest, {
  foreignKey: "userId",
  constraints: false,
  as: 'contactRequests'
});
