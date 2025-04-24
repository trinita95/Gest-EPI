import { Request, Response, NextFunction } from "express";
import { Epi, EpiModel } from "../models/EPI";

/**
 * Get request pour retourner tous les EPI.
 * @returns {Promise<Epi[]>} Une promesse qui résout avec un tableau d'objets Epi.
 */
export const getAllEpis = async () => {
    return (await EpiModel.getAll()) satisfies Epi[];
};

/**
 * Get request qui permet de récupérer un EPI par son ID.
 * @param {Request} request - L'objet de requête Express.
 * @returns {Promise<Epi | null>} Une promesse qui résout avec l'objet Epi correspondant.
 */
export const getEpiById = async (request: Request): Promise<Epi | null> => {
    const id: number = parseInt(request.params.id);
    return await EpiModel.getById(id);
};

/**
 * Post requête qui crée un EPI.
 * @param {Request} request - L'objet de requête Express.
 * @param {NextFunction} next - La fonction middleware suivante.
 * @param {Response} res - L'objet de réponse Express.
 * @returns {Promise<Epi | undefined>} Une promesse qui résout avec l'objet Epi créé ou undefined en cas d'erreur.
 */
export const createEpi = async (request: Request, next: NextFunction, res: Response): Promise<Epi | undefined> => {
    try {
        const data = request.body;
        const epi: Epi = {
            identifiant_perso: data.identifiant_perso,
            marque: data.marque,
            modele: data.modele,
            numero_serie: data.numero_serie,
            taille: data.taille,
            couleur: data.couleur,
            date_achat: data.date_achat ? new Date(data.date_achat) : undefined,
            date_fabrication: data.date_fabrication ? new Date(data.date_fabrication) : undefined,
            date_mise_service: data.date_mise_service ? new Date(data.date_mise_service) : undefined,
            periodicite_controle: data.periodicite_controle,
            type_epi_id: data.type_epi_id
        };

        const id = await EpiModel.create(epi);
        if (id) {
            const newEpi = await EpiModel.getById(id);
            return newEpi || undefined;
        }
        return undefined;
    } catch (e) {
        next(e);
        return undefined;
    }
};

/**
 * Permet de supprimer un EPI.
 * @param {Request} request - L'objet de requête Express.
 * @param {NextFunction} next - La fonction middleware suivante.
 * @returns {Promise<void>} Une promesse qui résout avec le résultat de la suppression.
 */
export const deleteEpi = async (request: Request, next: NextFunction): Promise<void> => {
    try {
        const id: number = parseInt(request.params.id);
        if (!id) {
            throw new Error("ID de l'EPI non fourni");
        }
        const success = await EpiModel.delete(id);
        if (!success) {
            throw new Error(`EPI avec l'ID ${id} non trouvé`);
        }
    } catch (e) {
        next(e);
    }
};

/**
 * Gère la mise à jour d'un EPI
 * @param request Requête Express
 * @param response Réponse Express
 * @param next Fonction next
 * @returns Promise<void>
 */
export const updateEpi = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id: number = parseInt(request.params.id);
        if (!id) {
            response.status(400).json({
                message: "L'ID de l'EPI est requis"
            });
            return;
        }

        const data = request.body;
        const epi: Epi = {
            identifiant_perso: data.identifiant_perso,
            marque: data.marque,
            modele: data.modele,
            numero_serie: data.numero_serie,
            taille: data.taille,
            couleur: data.couleur,
            date_achat: data.date_achat ? new Date(data.date_achat) : undefined,
            date_fabrication: data.date_fabrication ? new Date(data.date_fabrication) : undefined,
            date_mise_service: data.date_mise_service ? new Date(data.date_mise_service) : undefined,
            periodicite_controle: data.periodicite_controle,
            type_epi_id: data.type_epi_id
        };

        const success = await EpiModel.update(id, epi);
        if (!success) {
            response.status(404).json({
                message: `Aucun EPI trouvé avec l'ID ${id}`
            });
            return;
        }

        const updatedEpi = await EpiModel.getById(id);
        response.status(200).json({
            message: "EPI mis à jour avec succès",
            data: updatedEpi
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get request pour récupérer les EPI avec contrôles à venir
 * @param {Request} request - L'objet de requête Express.
 * @returns {Promise<Epi[]>} Une promesse qui résout avec un tableau d'objets Epi.
 */
export const getEpisWithUpcomingControls = async (request: Request): Promise<Epi[]> => {
    const daysThreshold = request.query.daysThreshold ? parseInt(request.query.daysThreshold as string) : 30;
    return await EpiModel.getEpisWithUpcomingControls(daysThreshold);
};