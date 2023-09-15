import fs from 'fs';
import path from 'path';
import { QueryInterface, STRING, Sequelize } from "sequelize";
import sequelize from "../sqlz/models/_index";

export default class DBUtilsController {

    public tableName: string = 'SequelizeMeta';

    public prefixDir: string = '../sqlz/';

    public queryInterface: QueryInterface;

    private async initSequelize() {
        this.queryInterface = sequelize.getQueryInterface()
        await this.createMigrationTable()
    }

    private async createMigrationTable() {
        try {
            await this.queryInterface.describeTable(this.tableName)
        } catch (err: any) {
            try {
                await this.queryInterface.createTable(this.tableName, {
                    name: {
                        type: STRING,
                        allowNull: false,
                        primaryKey: true,
                    }
                })
            } catch(err) {
                console.log(err)
            }
        }
    }

    constructor() {
        this.initSequelize()
    }

    private readFiles(filePath: string) {
        return fs.readdirSync(path.join(__dirname, filePath))
    }

    private getScriptNames(name: 'migrations' | 'seeders') {
        return this.readFiles(this.prefixDir + name)
    }

    public async migrate(): Promise<string[]> {
        await this.createMigrationTable()
        const migrations = this.getScriptNames('migrations')
        const result = await this.queryInterface.select(null, this.tableName)
        const data = result.map((item: any) => item.name)
        const list = migrations.filter(migration => !data.includes(migration))
        for (let i = 0; i < list.length; i++) {
            try {
                await require(`../sqlz/migrations/${list[i]}`).up(sequelize.getQueryInterface(), Sequelize);
                await this.queryInterface.insert(null, this.tableName, {
                    name: list[i]
                })
            } catch (err) {
                console.log(err);
                throw err;
            }
        }
        return list
    }

    public async seed() {
        const seeders = this.getScriptNames('seeders')
        for (let i = 0; i < seeders.length; i++) {
            try {
                await require(`../sqlz/seeders/${seeders[i]}`).up(sequelize.getQueryInterface(), Sequelize);
            } catch(err) {
                console.error(err)
                throw err
            }
        }
        return seeders
    }
}