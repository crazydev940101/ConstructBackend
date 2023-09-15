import { Model, BOOLEAN, Optional, INTEGER, TEXT } from "sequelize";
import { ISessionDetailPayload } from "../../interfaces/sessionDetail";
import { TABLES } from "../../constants/tables";
import { User } from "./user";
import sequelize from "./_index";

interface UserSessionDetailCreationAttributes
  extends Optional<ISessionDetailPayload, "id"> {}

export class UserSession
  extends Model<ISessionDetailPayload, UserSessionDetailCreationAttributes>
  implements ISessionDetailPayload
{
  public id: number;
  public token: string;
  public userId: number;
  public isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}

UserSession.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      type: INTEGER,
      primaryKey: true,
    },
    token: {
      type: TEXT,
      allowNull: false,
    },
    userId: {
      type: INTEGER,
      allowNull: false,
    },
    isActive: {
      type: BOOLEAN,
      allowNull: false,
    },
  },
  { sequelize, tableName: TABLES.USER_SESSION }
);

UserSession.belongsTo(User, {
  foreignKey: "id",
  constraints: false,
});

User.hasOne(UserSession, {
  foreignKey: "userId",
  constraints: false,
});
