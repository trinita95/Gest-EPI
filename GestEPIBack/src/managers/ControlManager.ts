import { Request, Response, NextFunction } from "express";
import { Control, ControlModel } from "../models/Control";

/**
 * Get request pour retourner tous les contrôles.
 * @returns {Promise<Control[]>} Une promesse qui résout avec un tableau d'objets Control.
 */
export const getAllControls = async () => {
    return (await ControlModel.getAll()) satisfies Control[];
};

/**
 * Get request qui permet de récupérer un contrôle par son ID.
 * @param {Request} request - L'objet de requête Express.
 * @returns {Promise<Control | null>} Une promesse qui résout avec l'objet Control correspondant.
 */
export const getControlById = async (request: Request): Promise<Control | null> => {
    const id: number = parseInt(request.params.id);
    return await ControlModel.getById(id);
};

/**
 * Get request qui permet de récupérer les contrôles d'un EPI.
 * @param {Request} request - L'objet de requête Express.
 * @returns {Promise<Control[]>} Une promesse qui résout avec un tableau d'objets Control.
 */
export const getControlsByEpiId = async (request: Request): Promise<Control[]> => {
    const epiId: number = parseInt(request.params.epiId);
    return await ControlModel.getByEpiId(epiId);
};

/**
 * Post requête qui crée un contrôle.
 * @param {Request} request - L'objet de requête Express.
 * @param {NextFunction} next - La fonction middleware suivante.
 * @param {Response} res - L'objet de réponse Express.
 * @returns {Promise<Control | undefined>} Une promesse qui résout avec l'objet Control créé ou undefined en cas d'erreur.
 */
export const createControl = async (request: Request, next: NextFunction, res: Response): Promise<Control | undefined> => {
    try {
        const data = request.body;
        const controle: Control = {
            date_controle: new Date(data.date_controle),
            remarques: data.remarques,
            gestionnaire_id: data.gestionnaire_id,
            epi_id: data.epi_id,
            statut_id: data.statut_id
        };

        const id = await ControlModel.create(controle);
        if (id) {
            const newControle = await ControlModel.getById(id);
            return newControle || undefined;
        }
        return undefined;
    } catch (e) {
        next(e);
        return undefined;
    }
};

/**
 * Permet de supprimer un contrôle.
 * @param {Request} request - L'objet de requête Express.
 * @param {NextFunction} next - La fonction middleware suivante.
 * @returns {Promise<void>} Une promesse qui résout avec le résultat de la suppression.
 */
export const deleteControl = async (request: Request, next: NextFunction): Promise<void> => {
    try {
        const id: number = parseInt(request.params.id);
        if (!id) {
            throw new Error("ID du contrôle non fourni");
        }
        const success = await ControlModel.delete(id);
        if (!success) {
            throw new Error(`Contrôle avec l'ID ${id} non trouvé`);
        }
    } catch (e) {
        next(e);
    }
};

/**
 * Gère la mise à jour d'un contrôle
 * @param request Requête Express
 * @param response Réponse Express
 * @param next Fonction next
 * @returns Promise<void>
 */
export const updateControl = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id: number = parseInt(request.params.id);
        if (!id) {
            response.status(400).json({
                message: "L'ID du contrôle est requis"
            });
            return;
        }

        const data = request.body;
        const controle: Control = {
            date_controle: new Date(data.date_controle),
            remarques: data.remarques,
            gestionnaire_id: data.gestionnaire_id,
            epi_id: data.epi_id,
            statut_id: data.statut_id
        };

        const success = await ControlModel.update(id, controle);
        if (!success) {
            response.status(404).json({
                message: `Aucun contrôle trouvé avec l'ID ${id}`
            });
            return;
        }

        const updatedControle = await ControlModel.getById(id);
        response.status(200).json({
            message: "Contrôle mis à jour avec succès",
            data: updatedControle
        });
    } catch (error) {
        next(error);
    }
};