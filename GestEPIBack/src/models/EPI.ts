import { db } from './bdd';
import { QueryResult } from './types';
import { EpiType, EpiTypeModel } from './EpiType';

export interface Epi {
    id?: number;
    identifiant_perso: string;
    marque: string;
    modele: string;
    numero_serie: string;
    taille?: string;
    couleur?: string;
    date_achat?: Date;
    date_fabrication?: Date;
    date_mise_service?: Date;
    periodicite_controle?: number;
    type_epi_id: number;
    type_epi?: EpiType; // Pour les jointures
}

export class EpiModel {
    public static async getAll(): Promise<Epi[]> {
        const { result } = await db.query<Epi[]>(`
            SELECT e.*, t.libelle as type_libelle, t.periodicite_controle as type_periodicite, t.est_textile 
            FROM epi e
            JOIN type_epi t ON e.type_epi_id = t.id
        `);

        // Transformer les résultats inclusion l'objet type_epi
        return result.map(epi => {
            const { type_libelle, type_periodicite, est_textile, ...epiData } = epi as any;
            return {
                ...epiData,
                type_epi: {
                    id: epi.type_epi_id,
                    libelle: type_libelle,
                    periodicite_controle: type_periodicite,
                    est_textile
                }
            };
        });
    }

    public static async getById(id: number): Promise<Epi | null> {
        const { result } = await db.query<Epi[]>(`
            SELECT e.*, t.libelle as type_libelle, t.periodicite_controle as type_periodicite, t.est_textile 
            FROM epi e
            JOIN type_epi t ON e.type_epi_id = t.id
            WHERE e.id = ?
        `, [id]);

        if (result.length === 0) return null;

        const { type_libelle, type_periodicite, est_textile, ...epiData } = result[0] as any;
        return {
            ...epiData,
            type_epi: {
                id: result[0].type_epi_id,
                libelle: type_libelle,
                periodicite_controle: type_periodicite,
                est_textile
            }
        };
    }

    public static async create(epi: Epi): Promise<number> {
        const { result } = await db.query<QueryResult>(`
            INSERT INTO epi (
                identifiant_perso, marque, modele, numero_serie, taille, couleur,
                date_achat, date_fabrication, date_mise_service, periodicite_controle, type_epi_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            epi.identifiant_perso, epi.marque, epi.modele, epi.numero_serie, epi.taille, epi.couleur,
            epi.date_achat, epi.date_fabrication, epi.date_mise_service, epi.periodicite_controle, epi.type_epi_id
        ]);

        return result.insertId || 0;
    }

    public static async update(id: number, epi: Epi): Promise<boolean> {
        const { affectedRows } = await db.query<QueryResult>(`
            UPDATE epi SET 
                identifiant_perso = ?, marque = ?, modele = ?, numero_serie = ?, 
                taille = ?, couleur = ?, date_achat = ?, date_fabrication = ?, 
                date_mise_service = ?, periodicite_controle = ?, type_epi_id = ?
            WHERE id = ?
        `, [
            epi.identifiant_perso, epi.marque, epi.modele, epi.numero_serie,
            epi.taille, epi.couleur, epi.date_achat, epi.date_fabrication,
            epi.date_mise_service, epi.periodicite_controle, epi.type_epi_id, id
        ]);

        return affectedRows !== undefined && affectedRows > 0;
    }

    public static async delete(id: number): Promise<boolean> {
        const { affectedRows } = await db.query<QueryResult>('DELETE FROM epi WHERE id = ?', [id]);
        return affectedRows !== undefined && affectedRows > 0;
    }

    // Méthode pour récupérer les EPI avec contrôle à venir
    public static async getEpisWithUpcomingControls(daysThreshold: number = 30): Promise<Epi[]> {
        const { result } = await db.query<any[]>(`
            SELECT e.*, t.libelle as type_libelle, t.periodicite_controle as type_periodicite, t.est_textile,
                  c.date_controle as dernier_controle
            FROM epi e
            JOIN type_epi t ON e.type_epi_id = t.id
            LEFT JOIN (
                SELECT epi_id, MAX(date_controle) as date_controle
                FROM controle
                GROUP BY epi_id
            ) c ON e.id = c.epi_id
            WHERE (
                c.date_controle IS NULL AND DATEDIFF(CURRENT_DATE, e.date_mise_service) > (COALESCE(e.periodicite_controle, t.periodicite_controle) - ${daysThreshold})
            ) OR (
                c.date_controle IS NOT NULL AND DATEDIFF(CURRENT_DATE, c.date_controle) > (COALESCE(e.periodicite_controle, t.periodicite_controle) - ${daysThreshold})
            )
        `);

        return result.map(item => {
            const { type_libelle, type_periodicite, est_textile, dernier_controle, ...epiData } = item;
            return {
                ...epiData,
                dernier_controle,
                type_epi: {
                    id: item.type_epi_id,
                    libelle: type_libelle,
                    periodicite_controle: type_periodicite,
                    est_textile
                }
            };
        });
    }
}