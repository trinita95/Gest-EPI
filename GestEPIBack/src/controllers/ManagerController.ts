import { Router, Request, Response, NextFunction } from "express";
import {
    deleteManager,
    getAllManagers,
    getManagerById,
    createManager,
    updateManager
} from "../managers/UserManager";
import { validateRequest } from "../middlewares";

const router: Router = Router();

/**
 * Route pour récupérer tous les gestionnaires ou un gestionnaire spécifique
 * @route GET /gestionnaires
 * @route GET /gestionnaires/:id
 * @returns {Response} Retourne le(s) gestionnaire(s) en JSON
 */
router.get("/", validateRequest("GET"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        const gestionnaires = await getAllManagers();
        if (gestionnaires.length === 0) {
            return res.status(200).json({ message: "Aucun gestionnaire n'est présent dans la base de données" });
        }
        return res.json(gestionnaires);
    } catch(error) {
        next(error);
    }
});

router.get("/:id", validateRequest("GET"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        const gestionnaire = await getManagerById(req);
        if (!gestionnaire) {
            return res.status(404).json({
                message: `Aucun gestionnaire trouvé avec l'ID ${req.params.id}`
            });
        }
        return res.json(gestionnaire);
    } catch(error) {
        next(error);
    }
});

/**
 * Route pour créer un nouveau gestionnaire
 * @route POST /gestionnaires
 * @returns {Response} Retourne le gestionnaire créé en JSON
 */
router.post("/", validateRequest("POST"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const gestionnaire = await createManager(req, next, res);
        if (gestionnaire) {
            res.status(201).json(gestionnaire);
        } else {
            res.status(400).json({ message: "Erreur lors de la création du gestionnaire" });
        }
    } catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Une erreur est survenue"
        });
    }
});

/**
 * Route pour mettre à jour un gestionnaire
 * @route PUT /gestionnaires/:id
 * @returns {Response} Retourne un message de confirmation
 */
router.put("/:id", validateRequest("PUT"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateManager(req, res, next);
    } catch (error) {
        if (!res.headersSent) {
            next(error);
        }
    }
});

/**
 * Route pour supprimer un gestionnaire
 * @route DELETE /gestionnaires/:id
 * @returns {Response} Retourne un message de confirmation
 */
router.delete("/:id", validateRequest("DELETE"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteManager(req, next);
        res.status(200).json({ message: "Gestionnaire supprimé avec succès" });
    } catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Une erreur est survenue"
        });
    }
});

export default router;