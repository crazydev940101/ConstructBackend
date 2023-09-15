import { Model, STRING, INTEGER, Optional, TEXT } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { ISystemSetting } from "../../interfaces";

interface SystemSettingCreationAttributes extends Optional<ISystemSetting, "id"> {}

export class SystemSetting
  extends Model<ISystemSetting, SystemSettingCreationAttributes>
  implements ISystemSetting
{
  public id!: number;
  public sKey: string;
  public sValue: string;
  public description: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}

SystemSetting.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sKey: {
      type: STRING,
      allowNull: false,
      unique: true,
    },
    sValue: {
      type: TEXT,
      allowNull: false
    },
    description: {
      type: TEXT,
      allowNull: true
    },
  },
  { sequelize, tableName: TABLES.SYSTEM_SETTING }
);
