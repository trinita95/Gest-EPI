// models/
import { db } from './bdd';
import { QueryResult } from './types';

export interface EpiType {
    id?: number;
    libelle: string;
    periodicite_controle: number;
    est_textile: boolean;
}

export class EpiTypeModel {
    public static async getAll(): Promise<EpiType[]> {
        const { result } = await db.query<EpiType[]>('SELECT * FROM type_epi');
        return result;
    }

    public static async getById(id: number): Promise<EpiType | null> {
        const { result } = await db.query<EpiType[]>('SELECT * FROM type_epi WHERE id = ?', [id]);
        return result.length > 0 ? result[0] : null;
    }

    public static async create(typeEpi: EpiType): Promise<number> {
        const { result } = await db.query<QueryResult>(
            'INSERT INTO type_epi (libelle, periodicite_controle, est_textile) VALUES (?, ?, ?)',
            [typeEpi.libelle, typeEpi.periodicite_controle, typeEpi.est_textile]
        );
        return result.insertId || 0;
    }

    public static async update(id: number, typeEpi: EpiType): Promise<boolean> {
        const { affectedRows } = await db.query<QueryResult>(
            'UPDATE type_epi SET libelle = ?, periodicite_controle = ?, est_textile = ? WHERE id = ?',
            [typeEpi.libelle, typeEpi.periodicite_controle, typeEpi.est_textile, id]
        );
        return affectedRows !== undefined && affectedRows > 0;
    }

    public static async delete(id: number): Promise<boolean> {
        const { affectedRows } = await db.query<QueryResult>('DELETE FROM type_epi WHERE id = ?', [id]);
        return affectedRows !== undefined && affectedRows > 0;
    }
}