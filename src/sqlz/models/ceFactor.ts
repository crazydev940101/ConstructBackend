import { Model, Optional, INTEGER, STRING, FLOAT } from "sequelize";
import { TABLES } from "../../constants/tables";
import sequelize from "./_index";
import { ICEFactor } from "../../interfaces";
import { Company } from "./company";

interface CEFactorDetailCreationAttributes
    extends Optional<ICEFactor, "id"> { }

export class CEFactor extends Model<ICEFactor, CEFactorDetailCreationAttributes> implements ICEFactor {
    public id!: number;
    public material: string;
    public factor: number;
    public companyId: number;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;
}

CEFactor.init(
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            type: INTEGER,
            primaryKey: true,
        },
        material: {
            type: STRING,
            allowNull: false,
        },
        factor: {
            type: FLOAT,
            allowNull: false
        },
        companyId: {
            type: INTEGER,
            allowNull: true
        },
    },
    { sequelize, tableName: TABLES.CARBON_EMISSION_FACTOR }
);

CEFactor.belongsTo(Company, {
    foreignKey: "companyId",
    constraints: false,
    as: 'company'
});

Company.hasMany(CEFactor, {
    foreignKey: "companyId",
    constraints: false,
    as: 'ceFactors'
});
