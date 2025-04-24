import { db } from './bdd';
import { QueryResult } from './types';

export interface Manager {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    password: string;
    created_at?: Date;
}

export class ManagerModel {
    public static async getAll(): Promise<Manager[]> {
        const { result } = await db.query<Manager[]>('SELECT * FROM gestionnaire');
        return result;
    }

    public static async getById(id: number): Promise<Manager | null> {
        const { result } = await db.query<Manager[]>('SELECT * FROM gestionnaire WHERE id = ?', [id]);
        return result.length > 0 ? result[0] : null;
    }

    public static async getByEmail(email: string): Promise<Manager | null> {
        const { result } = await db.query<Manager[]>('SELECT * FROM gestionnaire WHERE email = ?', [email]);
        return result.length > 0 ? result[0] : null;
    }

    public static async create(gestionnaire: Manager): Promise<number> {
        const { result } = await db.query<QueryResult>(
            'INSERT INTO gestionnaire (nom, prenom, email, password) VALUES (?, ?, ?, ?)',
            [gestionnaire.nom, gestionnaire.prenom, gestionnaire.email, gestionnaire.password]
        );
        return result.insertId || 0;
    }

    public static async update(id: number, gestionnaire: Manager): Promise<boolean> {
        const { affectedRows } = await db.query<QueryResult>(
            'UPDATE gestionnaire SET nom = ?, prenom = ?, email = ?, password = ? WHERE id = ?',
            [gestionnaire.nom, gestionnaire.prenom, gestionnaire.email, gestionnaire.password, id]
        );
        return affectedRows !== undefined && affectedRows > 0;
    }

    public static async delete(id: number): Promise<boolean> {
        const { affectedRows } = await db.query<QueryResult>('DELETE FROM gestionnaire WHERE id = ?', [id]);
        return affectedRows !== undefined && affectedRows > 0;
    }
}