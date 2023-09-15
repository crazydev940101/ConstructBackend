import { Model, STRING, INTEGER, Optional } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { IUserSetting } from "../../interfaces";
import { User } from "./user";

interface UserSettingCreationAttributes extends Optional<IUserSetting, "id"> {}

export class UserSetting
  extends Model<IUserSetting, UserSettingCreationAttributes>
  implements IUserSetting
{
  public id!: number;
  public userId: number;
  public key: string;
  public value: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

}

UserSetting.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: STRING(50),
    value: STRING(50),
    userId: {
      type: INTEGER,
      allowNull: false
    },
  },
  { sequelize, tableName: TABLES.USER_SETTING }
);

UserSetting.belongsTo(User, {
  foreignKey: "userId",
  constraints: false,
  as: 'user'
});

User.hasMany(UserSetting, {
  foreignKey: "userId",
  constraints: false,
  as: 'settings'
});
