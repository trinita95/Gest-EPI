import { Request, Response, NextFunction } from "express";
import { EpiType, EpiTypeModel } from "../models/EpiType";

/**
 * Get request pour retourner tous les types d'EPI.
 * @returns {Promise<EpiType[]>} Une promesse qui résout avec un tableau d'objets EpiType.
 */
export const getAllEpiTypes = async () => {
    return (await EpiTypeModel.getAll()) satisfies EpiType[];
};

/**
 * Get request qui permet de récupérer un type d'EPI par son ID.
 * @param {Request} request - L'objet de requête Express.
 * @returns {Promise<EpiType | null>} Une promesse qui résout avec l'objet EpiType correspondant.
 */
export const getEpiTypeById = async (request: Request): Promise<EpiType | null> => {
    const id: number = parseInt(request.params.id);
    return await EpiTypeModel.getById(id);
};

/**
 * Post requête qui crée un type d'EPI.
 * @param {Request} request - L'objet de requête Express.
 * @param {NextFunction} next - La fonction middleware suivante.
 * @param {Response} res - L'objet de réponse Express.
 * @returns {Promise<EpiType | undefined>} Une promesse qui résout avec l'objet EpiType créé ou undefined en cas d'erreur.
 */
export const createEpiType = async (request: Request, next: NextFunction, res: Response): Promise<EpiType | undefined> => {
    try {
        console.log("Body reçu:", request.body);
        const data = request.body;
        const typeEpi: EpiType = {
            libelle: data.libelle,
            periodicite_controle: data.periodicite_controle,
            est_textile: data.est_textile
        };

        const id = await EpiTypeModel.create(typeEpi);
        if (id) {
            const newTypeEpi = await EpiTypeModel.getById(id);
            return newTypeEpi || undefined;
        }
        return undefined;
    } catch (e) {
        next(e);
        return undefined;
    }
};

/**
 * Permet de supprimer un type d'EPI.
 * @param {Request} request - L'objet de requête Express.
 * @param {NextFunction} next - La fonction middleware suivante.
 * @returns {Promise<void>} Une promesse qui résout avec le résultat de la suppression.
 */
export const deleteEpiType = async (request: Request, next: NextFunction): Promise<void> => {
    try {
        const id: number = parseInt(request.params.id);
        if (!id) {
            throw new Error("ID du type d'EPI non fourni");
        }
        const success = await EpiTypeModel.delete(id);
        if (!success) {
            throw new Error(`Type d'EPI avec l'ID ${id} non trouvé`);
        }
    } catch (e) {
        next(e);
    }
};

/**
 * Gère la mise à jour d'un type d'EPI
 * @param request Requête Express
 * @param response Réponse Express
 * @param next Fonction next
 * @returns Promise<void>
 */
export const updateEpiType = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id: number = parseInt(request.params.id);
        if (!id) {
            response.status(400).json({
                message: "L'ID du type d'EPI est requis"
            });
            return;
        }

        const typeEpi: EpiType = {
            libelle: request.body.libelle,
            periodicite_controle: request.body.periodicite_controle,
            est_textile: request.body.est_textile
        };

        const success = await EpiTypeModel.update(id, typeEpi);
        if (!success) {
            response.status(404).json({
                message: `Aucun type d'EPI trouvé avec l'ID ${id}`
            });
            return;
        }

        const updatedTypeEpi = await EpiTypeModel.getById(id);
        response.status(200).json({
            message: "Type d'EPI mis à jour avec succès",
            data: updatedTypeEpi
        });
    } catch (error) {
        next(error);
    }
};