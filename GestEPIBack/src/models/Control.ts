import { db } from './bdd';
import { QueryResult } from './types';
import { Epi } from './EPI';
import { Manager } from './Manager';
import { ControlStatus } from './ControlStatuts';

export interface Control {
    id?: number;
    date_controle: Date;
    remarques?: string;
    gestionnaire_id: number;
    epi_id: number;
    statut_id: number;
    created_at?: Date;
    gestionnaire?: Manager; 
    epi?: Epi; 
    statut?: ControlStatus; 
}

export class ControlModel {
    public static async getAll(): Promise<Control[]> {
        const { result } = await db.query<Control[]>(`
            SELECT c.*, 
                   g.nom as gestionnaire_nom, g.prenom as gestionnaire_prenom,
                   e.identifiant_perso, e.marque, e.modele,
                   s.libelle as statut_libelle
            FROM controle c
            JOIN gestionnaire g ON c.gestionnaire_id = g.id
            JOIN epi e ON c.epi_id = e.id
            JOIN statut_controle s ON c.statut_id = s.id
            ORDER BY c.date_controle DESC
        `);

        // Transformer les résultats
        return result.map(controle => {
            const { gestionnaire_nom, gestionnaire_prenom, identifiant_perso, marque, modele, statut_libelle, ...controleData } = controle as any;
            return {
                ...controleData,
                gestionnaire: {
                    id: controle.gestionnaire_id,
                    nom: gestionnaire_nom,
                    prenom: gestionnaire_prenom
                },
                epi: {
                    id: controle.epi_id,
                    identifiant_perso,
                    marque,
                    modele
                },
                statut: {
                    id: controle.statut_id,
                    libelle: statut_libelle
                }
            };
        });
    }

    public static async getById(id: number): Promise<Control | null> {
        const { result } = await db.query<Control[]>(`
            SELECT c.*, 
                   g.nom as gestionnaire_nom, g.prenom as gestionnaire_prenom,
                   e.identifiant_perso, e.marque, e.modele,
                   s.libelle as statut_libelle
            FROM controle c
            JOIN gestionnaire g ON c.gestionnaire_id = g.id
            JOIN epi e ON c.epi_id = e.id
            JOIN statut_controle s ON c.statut_id = s.id
            WHERE c.id = ?
        `, [id]);

        if (result.length === 0) return null;

        const { gestionnaire_nom, gestionnaire_prenom, identifiant_perso, marque, modele, statut_libelle, ...controleData } = result[0] as any;
        return {
            ...controleData,
            gestionnaire: {
                id: result[0].gestionnaire_id,
                nom: gestionnaire_nom,
                prenom: gestionnaire_prenom
            },
            epi: {
                id: result[0].epi_id,
                identifiant_perso,
                marque,
                modele
            },
            statut: {
                id: result[0].statut_id,
                libelle: statut_libelle
            }
        };
    }

    public static async getByEpiId(epiId: number): Promise<Control[]> {
        const { result } = await db.query<Control[]>(`
            SELECT c.*, 
                   g.nom as gestionnaire_nom, g.prenom as gestionnaire_prenom,
                   e.identifiant_perso, e.marque, e.modele,
                   s.libelle as statut_libelle
            FROM controle c
            JOIN gestionnaire g ON c.gestionnaire_id = g.id
            JOIN epi e ON c.epi_id = e.id
            JOIN statut_controle s ON c.statut_id = s.id
            WHERE c.epi_id = ?
            ORDER BY c.date_controle DESC
        `, [epiId]);

        return result.map(controle => {
            const { gestionnaire_nom, gestionnaire_prenom, identifiant_perso, marque, modele, statut_libelle, ...controleData } = controle as any;
            return {
                ...controleData,
                gestionnaire: {
                    id: controle.gestionnaire_id,
                    nom: gestionnaire_nom,
                    prenom: gestionnaire_prenom
                },
                epi: {
                    id: controle.epi_id,
                    identifiant_perso,
                    marque,
                    modele
                },
                statut: {
                    id: controle.statut_id,
                    libelle: statut_libelle
                }
            };
        });
    }

    public static async create(controle: Control): Promise<number> {
        const { result } = await db.query<QueryResult>(`
            INSERT INTO controle (date_controle, remarques, gestionnaire_id, epi_id, statut_id)
            VALUES (?, ?, ?, ?, ?)
        `, [
            controle.date_controle,
            controle.remarques,
            controle.gestionnaire_id,
            controle.epi_id,
            controle.statut_id
        ]);

        return result.insertId || 0;
    }

    public static async update(id: number, controle: Control): Promise<boolean> {
        const { affectedRows } = await db.query<QueryResult>(`
            UPDATE controle SET 
                date_controle = ?, 
                remarques = ?, 
                gestionnaire_id = ?, 
                epi_id = ?, 
                statut_id = ?
            WHERE id = ?
        `, [
            controle.date_controle,
            controle.remarques,
            controle.gestionnaire_id,
            controle.epi_id,
            controle.statut_id,
            id
        ]);

        return affectedRows !== undefined && affectedRows > 0;
    }

    public static async delete(id: number): Promise<boolean> {
        const { affectedRows } = await db.query<QueryResult>('DELETE FROM controle WHERE id = ?', [id]);
        return affectedRows !== undefined && affectedRows > 0;
    }
}