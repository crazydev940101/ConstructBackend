import { Model, STRING, INTEGER, Optional, TEXT, ENUM } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { IOpenAIPromptKey, EOpenaiModel } from "../../interfaces";
import { OpenAIPrompt } from "./openaiPrompt";
import { ChatBotHistory } from "./chatbotHistory";

interface OpenAIPromptKeyCreationAttributes extends Optional<IOpenAIPromptKey, "id"> {}

export class OpenAIPromptKey
  extends Model<IOpenAIPromptKey, OpenAIPromptKeyCreationAttributes>
  implements IOpenAIPromptKey
{
  public id!: number;
  public pKey: string;
  public openaiModel: EOpenaiModel;
  public description: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public prompts: OpenAIPrompt[];
  public chatbotHistory: ChatBotHistory[];
}

OpenAIPromptKey.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pKey: {
      type: STRING,
      allowNull: false,
      unique: true,
    },
    openaiModel: {
      type: ENUM('text-davinci-003', 'gpt-3.5-turbo'),
      allowNull: false,
      defaultValue: 'gpt-3.5-turbo'
    },
    description: {
      type: TEXT,
      allowNull: true
    },
  },
  { sequelize, tableName: TABLES.OPENAI_PROMPT_KEY }
);
