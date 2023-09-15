import { Model, INTEGER, Optional, TEXT, JSON } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { IOpenAIPrompt } from "../../interfaces";
import { OpenAIPromptKey } from "./openaiPromptKey";
import { ChatCompletionRequestMessage } from "openai";

interface OpenAIPromptCreationAttributes extends Optional<IOpenAIPrompt, "id"> {}

export class OpenAIPrompt
  extends Model<IOpenAIPrompt, OpenAIPromptCreationAttributes>
  implements IOpenAIPrompt
{
  public id!: number;
  public promptKeyId: number;
  public prompt: string;
  public chatCompletionRequestMessages: ChatCompletionRequestMessage[];
  public description: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  public pKey: OpenAIPromptKey;
}

OpenAIPrompt.init(
  {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    promptKeyId: {
      type: INTEGER,
      allowNull: false,
    },
    prompt: {
      type: TEXT,
      allowNull: false
    },
    chatCompletionRequestMessages: {
      type: JSON,
      allowNull: true
    }
  },
  { sequelize, tableName: TABLES.OPENAI_PROMPT }
);

OpenAIPrompt.belongsTo(OpenAIPromptKey, {
  foreignKey: "promptKeyId",
  constraints: false,
  as: 'pKey'
});

OpenAIPromptKey.hasMany(OpenAIPrompt, {
  foreignKey: "promptKeyId",
  constraints: false,
  as: 'prompts'
});