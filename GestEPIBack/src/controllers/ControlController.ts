import { Router, Request, Response, NextFunction } from "express";
import {
    deleteControl,
    getAllControls,
    getControlById,
    createControl,
    updateControl,
    getControlsByEpiId
} from "../managers/ControlManager";
import { validateRequest } from "../middlewares";

const router: Router = Router();

/**
 * Route pour récupérer tous les contrôles ou un contrôle spécifique
 * @route GET /controles
 * @route GET /controles/:id
 * @returns {Response} Retourne le(s) contrôle(s) en JSON
 */
router.get("/", validateRequest("GET"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        const controles = await getAllControls();
        if (controles.length === 0) {
            return res.status(200).json({ message: "Aucun contrôle n'est présent dans la base de données" });
        }
        return res.json(controles);
    } catch(error) {
        next(error);
    }
});

router.get("/:id", validateRequest("GET"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        const controle = await getControlById(req);
        if (!controle) {
            return res.status(404).json({
                message: `Aucun contrôle trouvé avec l'ID ${req.params.id}`
            });
        }
        return res.json(controle);
    } catch(error) {
        next(error);
    }
});

/**
 * Route pour récupérer les contrôles d'un EPI spécifique
 * @route GET /controles/epi/:epiId
 * @returns {Response} Retourne les contrôles en JSON
 */
router.get("/epi/:epiId", validateRequest("GET"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        const controles = await getControlsByEpiId(req);
        if (controles.length === 0) {
            return res.status(200).json({
                message: `Aucun contrôle trouvé pour l'EPI avec l'ID ${req.params.epiId}`
            });
        }
        return res.json(controles);
    } catch(error) {
        next(error);
    }
});

/**
 * Route pour créer un nouveau contrôle
 * @route POST /controles
 * @returns {Response} Retourne le contrôle créé en JSON
 */
router.post("/", validateRequest("POST"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const controle = await createControl(req, next, res);
        if (controle) {
            res.status(201).json(controle);
        } else {
            res.status(400).json({ message: "Erreur lors de la création du contrôle" });
        }
    } catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Une erreur est survenue"
        });
    }
});

/**
 * Route pour mettre à jour un contrôle
 * @route PUT /controles/:id
 * @returns {Response} Retourne un message de confirmation
 */
router.put("/:id", validateRequest("PUT"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateControl(req, res, next);
    } catch (error) {
        if (!res.headersSent) {
            next(error);
        }
    }
});

/**
 * Route pour supprimer un contrôle
 * @route DELETE /controles/:id
 * @returns {Response} Retourne un message de confirmation
 */
router.delete("/:id", validateRequest("DELETE"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteControl(req, next);
        res.status(200).json({ message: "Contrôle supprimé avec succès" });
    } catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Une erreur est survenue"
        });
    }
});

export default router;