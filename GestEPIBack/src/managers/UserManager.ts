import { Request, Response, NextFunction } from "express";
import { Manager, ManagerModel } from "../models/Manager";

/**
 * Get request pour retourner tous les gestionnaires.
 * @returns {Promise<Manager[]>} Une promesse qui résout avec un tableau d'objets Gestionnaire.
 */
export const getAllManagers = async () => {
    return (await ManagerModel.getAll()) satisfies Manager[];
};

/**
 * Get request qui permet de récupérer un gestionnaire par son ID.
 * @param {Request} request - L'objet de requête Express.
 * @returns {Promise<Manager | null>} Une promesse qui résout avec l'objet Gestionnaire correspondant.
 */
export const getManagerById = async (request: Request): Promise<Manager | null> => {
    const id: number = parseInt(request.params.id);
    return await ManagerModel.getById(id);
};

/**
 * Post requête qui crée un gestionnaire.
 * @param {Request} request - L'objet de requête Express.
 * @param {NextFunction} next - La fonction middleware suivante.
 * @param {Response} res - L'objet de réponse Express.
 * @returns {Promise<Manager | undefined>} Une promesse qui résout avec l'objet Gestionnaire créé ou undefined en cas d'erreur.
 */
export const createManager = async (request: Request, next: NextFunction, res: Response): Promise<Manager | undefined> => {
    try {
        const data = request.body;
        const gestionnaire: Manager = {
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            password: data.password // Note: Dans un cas réel, vous devriez hacher le mot de passe
        };

        const id = await ManagerModel.create(gestionnaire);
        if (id) {
            const newGestionnaire = await ManagerModel.getById(id);
            return newGestionnaire || undefined;
        }
        return undefined;
    } catch (e) {
        next(e);
        return undefined;
    }
};

/**
 * Permet de supprimer un gestionnaire.
 * @param {Request} request - L'objet de requête Express.
 * @param {NextFunction} next - La fonction middleware suivante.
 * @returns {Promise<void>} Une promesse qui résout avec le résultat de la suppression.
 */
export const deleteManager = async (request: Request, next: NextFunction): Promise<void> => {
    try {
        const id: number = parseInt(request.params.id);
        if (!id) {
            throw new Error("ID du gestionnaire non fourni");
        }
        const success = await ManagerModel.delete(id);
        if (!success) {
            throw new Error(`Gestionnaire avec l'ID ${id} non trouvé`);
        }
    } catch (e) {
        next(e);
    }
};

/**
 * Gère la mise à jour d'un gestionnaire
 * @param request Requête Express
 * @param response Réponse Express
 * @param next Fonction next
 * @returns Promise<void>
 */
export const updateManager = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id: number = parseInt(request.params.id);
        if (!id) {
            response.status(400).json({
                message: "L'ID du gestionnaire est requis"
            });
            return;
        }

        const gestionnaire: Manager = {
            nom: request.body.nom,
            prenom: request.body.prenom,
            email: request.body.email,
            password: request.body.password // Note: Dans un cas réel, vous devriez gérer la mise à jour du mot de passe différemment
        };

        const success = await ManagerModel.update(id, gestionnaire);
        if (!success) {
            response.status(404).json({
                message: `Aucun gestionnaire trouvé avec l'ID ${id}`
            });
            return;
        }

        const updatedGestionnaire = await ManagerModel.getById(id);
        response.status(200).json({
            message: "Gestionnaire mis à jour avec succès",
            data: updatedGestionnaire
        });
    } catch (error) {
        next(error);
    }
};