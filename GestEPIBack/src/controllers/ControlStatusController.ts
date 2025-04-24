import { Router, Request, Response, NextFunction } from "express";
import {
    deleteControlStatus,
    getAllControlStatuses,
    getControlStatusById,
    createControlStatus,
    updateControlStatus
} from "../managers/ControlStatusManager";
import { validateRequest } from "../middlewares";

const router: Router = Router();

/**
 * Route pour récupérer tous les statuts de contrôle ou un statut spécifique
 * @route GET /statut-controles
 * @route GET /statut-controles/:id
 * @returns {Response} Retourne le(s) statut(s) de contrôle en JSON
 */
router.get("/", validateRequest("GET"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        const statutControles = await getAllControlStatuses();
        if (statutControles.length === 0) {
            return res.status(200).json({ message: "Aucun statut de contrôle n'est présent dans la base de données" });
        }
        return res.json(statutControles);
    } catch(error) {
        next(error);
    }
});

router.get("/:id", validateRequest("GET"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        const statutControle = await getControlStatusById(req);
        if (!statutControle) {
            return res.status(404).json({
                message: `Aucun statut de contrôle trouvé avec l'ID ${req.params.id}`
            });
        }
        return res.json(statutControle);
    } catch(error) {
        next(error);
    }
});

/**
 * Route pour créer un nouveau statut de contrôle
 * @route POST /statut-controles
 * @returns {Response} Retourne le statut de contrôle créé en JSON
 */
router.post("/", validateRequest("POST"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const statutControle = await createControlStatus(req, next, res);
        if (statutControle) {
            res.status(201).json(statutControle);
        } else {
            res.status(400).json({ message: "Erreur lors de la création du statut de contrôle" });
        }
    } catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Une erreur est survenue"
        });
    }
});

/**
 * Route pour mettre à jour un statut de contrôle
 * @route PUT /statut-controles/:id
 * @returns {Response} Retourne un message de confirmation
 */
router.put("/:id", validateRequest("PUT"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateControlStatus(req, res, next);
    } catch (error) {
        if (!res.headersSent) {
            next(error);
        }
    }
});

/**
 * Route pour supprimer un statut de contrôle
 * @route DELETE /statut-controles/:id
 * @returns {Response} Retourne un message de confirmation
 */
router.delete("/:id", validateRequest("DELETE"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteControlStatus(req, next);
        res.status(200).json({ message: "Statut de contrôle supprimé avec succès" });
    } catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Une erreur est survenue"
        });
    }
});

export default router;