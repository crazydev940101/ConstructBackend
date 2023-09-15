import { Model, STRING, INTEGER, Optional, JSON } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { INewsletter } from "../../interfaces";
import { User } from "./user";

interface NewsletterCreationAttributes extends Optional<INewsletter, "id"> {}

export class Newsletter
  extends Model<INewsletter, NewsletterCreationAttributes>
  implements INewsletter
{
  public id!: number;
  public userId: number;
  public firstname: string;
  public lastname: string;
  public email: string;
  public company: string;
  public publicationId: string;
  public metadata: any;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

}

Newsletter.init(
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
    firstname: {
      type: STRING,
      allowNull: false
    },
    lastname: {
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
    publicationId: {
      type: STRING,
      allowNull: false
    },
    metadata: {
      type: JSON,
      allowNull: false
    },
  },
  { sequelize, tableName: TABLES.NEWSLETTER }
);

Newsletter.belongsTo(User, {
  foreignKey: "userId",
  constraints: false,
  as: 'user'
});

User.hasMany(Newsletter, {
  foreignKey: "userId",
  constraints: false,
  as: 'newsletters'
});
