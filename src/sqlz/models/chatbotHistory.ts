import { Model, BOOLEAN, JSON, INTEGER, Optional, TEXT, DATE } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { IChatBotHistory } from "../../interfaces";
import { User } from "./user";
import { OpenAIPromptKey } from "./openaiPromptKey";

interface ChatBotHistoryCreationAttributes extends Optional<IChatBotHistory, "id"> {}

export class ChatBotHistory
  extends Model<IChatBotHistory, ChatBotHistoryCreationAttributes>
  implements IChatBotHistory
{
  public id!: number;
  public userId: number;
  public promptKeyId: number;
  public promptVersion: Date;
  public question: string;
  public answer: string;
  public isPublic: boolean;
  public additionalData?: { [key: string]: string; } | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
}

ChatBotHistory.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: INTEGER,
      allowNull: true,
    },
    promptKeyId: {
      type: INTEGER,
      allowNull: false,
    },
    promptVersion: {
      type: DATE,
      allowNull: false
    },
    question: {
      type: TEXT,
      allowNull: false,
    },
    answer: {
      type: TEXT,
      allowNull: false
    },
    isPublic: {
      type: BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    additionalData: {
      type: JSON,
      allowNull: true,
    },
  },
  { sequelize, tableName: TABLES.CHATBOT_HISTORY }
);

ChatBotHistory.belongsTo(User, {
  foreignKey: "userId",
  constraints: false,
  as: 'user'
});

User.hasMany(ChatBotHistory, {
  foreignKey: "userId",
  constraints: false,
  as: 'chatbotHistory'
});

ChatBotHistory.belongsTo(OpenAIPromptKey, {
  foreignKey: "promptKeyId",
  constraints: false,
  as: 'pKey'
});

OpenAIPromptKey.hasMany(ChatBotHistory, {
  foreignKey: "promptKeyId",
  constraints: false,
  as: 'chatbotHistory'
});
