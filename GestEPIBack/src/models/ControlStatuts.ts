import { db } from './bdd';
import { QueryResult } from './types';

export interface ControlStatus {
    id?: number;
    libelle: string;
}

export class ControlStatusModel {
    public static async getAll(): Promise<ControlStatus[]> {
        const { result } = await db.query<ControlStatus[]>('SELECT * FROM statut_controle');
        return result;
    }

    public static async getById(id: number): Promise<ControlStatus | null> {
        const { result } = await db.query<ControlStatus[]>('SELECT * FROM statut_controle WHERE id = ?', [id]);
        return result.length > 0 ? result[0] : null;
    }

    public static async create(statutControle: ControlStatus): Promise<number> {
        const { result } = await db.query<QueryResult>(
            'INSERT INTO statut_controle (libelle) VALUES (?)',
            [statutControle.libelle]
        );
        return result.insertId || 0;
    }

    public static async update(id: number, statutControle: ControlStatus): Promise<boolean> {
        const { affectedRows } = await db.query<QueryResult>(
            'UPDATE statut_controle SET libelle = ? WHERE id = ?',
            [statutControle.libelle, id]
        );
        return affectedRows !== undefined && affectedRows > 0;
    }

    public static async delete(id: number): Promise<boolean> {
        const { affectedRows } = await db.query<QueryResult>('DELETE FROM statut_controle WHERE id = ?', [id]);
        return affectedRows !== undefined && affectedRows > 0;
    }
}