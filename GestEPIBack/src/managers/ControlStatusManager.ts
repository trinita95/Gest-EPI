import { Request, Response, NextFunction } from "express";
import { ControlStatus, ControlStatusModel } from "../models/ControlStatuts";

/**
 * Get request pour retourner tous les statuts de contrôle.
 * @returns {Promise<ControlStatus[]>} Une promesse qui résout avec un tableau d'objets ControlStatus.
 */
export const getAllControlStatuses = async () => {
    return (await ControlStatusModel.getAll()) satisfies ControlStatus[];
};

/**
 * Get request qui permet de récupérer un statut de contrôle par son ID.
 * @param {Request} request - L'objet de requête Express.
 * @returns {Promise<ControlStatus | null>} Une promesse qui résout avec l'objet ControlStatus correspondant.
 */
export const getControlStatusById = async (request: Request): Promise<ControlStatus | null> => {
    const id: number = parseInt(request.params.id);
    return await ControlStatusModel.getById(id);
};

/**
 * Post requête qui crée un statut de contrôle.
 * @param {Request} request - L'objet de requête Express.
 * @param {NextFunction} next - La fonction middleware suivante.
 * @param {Response} res - L'objet de réponse Express.
 * @returns {Promise<ControlStatus | undefined>} Une promesse qui résout avec l'objet ControlStatus créé ou undefined en cas d'erreur.
 */
export const createControlStatus = async (request: Request, next: NextFunction, res: Response): Promise<ControlStatus | undefined> => {
    try {
        const data = request.body;
        const statutControle: ControlStatus = {
            libelle: data.libelle
        };

        const id = await ControlStatusModel.create(statutControle);
        if (id) {
            const newStatutControle = await ControlStatusModel.getById(id);
            return newStatutControle || undefined;
        }
        return undefined;
    } catch (e) {
        next(e);
        return undefined;
    }
};

/**
 * Permet de supprimer un statut de contrôle.
 * @param {Request} request - L'objet de requête Express.
 * @param {NextFunction} next - La fonction middleware suivante.
 * @returns {Promise<void>} Une promesse qui résout avec le résultat de la suppression.
 */
export const deleteControlStatus = async (request: Request, next: NextFunction): Promise<void> => {
    try {
        const id: number = parseInt(request.params.id);
        if (!id) {
            throw new Error("ID du statut de contrôle non fourni");
        }
        const success = await ControlStatusModel.delete(id);
        if (!success) {
            throw new Error(`Statut de contrôle avec l'ID ${id} non trouvé`);
        }
    } catch (e) {
        next(e);
    }
};

/**
 * Gère la mise à jour d'un statut de contrôle
 * @param request Requête Express
 * @param response Réponse Express
 * @param next Fonction next
 * @returns Promise<void>
 */
export const updateControlStatus = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id: number = parseInt(request.params.id);
        if (!id) {
            response.status(400).json({
                message: "L'ID du statut de contrôle est requis"
            });
            return;
        }

        const statutControle: ControlStatus = {
            libelle: request.body.libelle
        };

        const success = await ControlStatusModel.update(id, statutControle);
        if (!success) {
            response.status(404).json({
                message: `Aucun statut de contrôle trouvé avec l'ID ${id}`
            });
            return;
        }

        const updatedStatutControle = await ControlStatusModel.getById(id);
        response.status(200).json({
            message: "Statut de contrôle mis à jour avec succès",
            data: updatedStatutControle
        });
    } catch (error) {
        next(error);
    }
};