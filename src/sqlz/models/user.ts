import { Model, STRING, INTEGER, Optional, ENUM } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { EUserRole, IUserPayload, EUserStatus } from "../../interfaces";
import { UserRoles } from "../../constants/common";
import { Company } from "./company";
import { UserSetting } from "./userSetting";

interface UserCreationAttributes extends Optional<IUserPayload, "id"> {}

export class User
  extends Model<IUserPayload, UserCreationAttributes>
  implements IUserPayload
{
  public id!: number;
  public firstname: string;
  public lastname: string;
  public jobTitle: string;
  public role: EUserRole;
  public email: string;
  public password: string;
  public companyId: number;
  public stripeCustomerId: string;
  public status: EUserStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public company: Company;
  public settings: UserSetting[]
}

User.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstname: STRING(50),
    lastname: STRING(50),
    jobTitle: STRING(255),
    role: {
      type: ENUM(...UserRoles),
      defaultValue: EUserRole.SUPER_ADMIN,
      allowNull: false,
    },
    email: {
      type: STRING(50),
      allowNull: false,
      unique: true,
    },
    password: {
      type: STRING(100),
      allowNull: false,
    },
    companyId: {
      type: INTEGER,
      allowNull: true
    },
    stripeCustomerId: {
      type: STRING,
      allowNull: true
    },
    status: {
      type: ENUM('pending', 'active', 'declined'),
      defaultValue: 'active',
      allowNull: false
    }
  },
  { sequelize, tableName: TABLES.USER }
);

User.belongsTo(Company, {
  foreignKey: "companyId",
  constraints: false,
  as: 'company'
});

Company.hasMany(User, {
  foreignKey: "companyId",
  constraints: false,
  as: 'users'
});
