
import mariadb, {PoolConnection} from "mariadb";
import dotenv from "dotenv";
import {QueryResult} from "./types";

dotenv.config();

export class Database {
    private static instance: Database;
    private pool: mariadb.Pool;
    constructor() {
        this.pool = this.createPool();
    }

    public getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    private createPool() {
        this.pool = mariadb.createPool({
            host: process.env.DATABASE_IP || "localhost",
            user: process.env.DATABASE_USER || "root",
            password: process.env.DATABASE_PASSWORD || "Ahcene00",
            database: process.env.DATABASE_NAME || "base_militaire",
            connectionLimit: 5,
        })
        return this.pool;
    }

    public async getConnection(): Promise<PoolConnection> {
        try {
            return await this.pool.getConnection();
        } catch (error) {
            console.error("getConnection: error");
            throw error;
        }
    }

    public async query<T = any>(sql: string, params?: any): Promise<{ result: T; affectedRows?: number }> {
        let conn: PoolConnection | undefined;

        try {
            conn = await this.getConnection();
            const result = await conn.query(sql, params);

            let affectedRows: number | undefined;
            if (Array.isArray(result)) {
                // if select
                return { result: result as T };
            } else {

                affectedRows = (result as QueryResult).affectedRows;
                return { result: result as T, affectedRows };
            }
        } catch (err) {
            console.error(`database (query): ${err}`);
            throw err;
        } finally {
            if (conn) await conn.release();
        }
    }
}

export let db = new Database();