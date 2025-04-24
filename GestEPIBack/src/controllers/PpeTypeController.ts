import { Router, Request, Response, NextFunction } from "express";
import {
    deleteEpiType,
    getAllEpiTypes,
    getEpiTypeById,
    createEpiType,
    updateEpiType
} from "../managers/PpeTypeManager";
import { validateRequest } from "../middlewares";

const router: Router = Router();

/**
 * Route pour récupérer tous les types d'EPI ou un type spécifique
 * @route GET /type-epi
 * @route GET /type-epi/:id
 * @returns {Response} Retourne le(s) type(s) d'EPI en JSON
 */
router.get("/", validateRequest("GET"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        const typeEpis = await getAllEpiTypes();
        if (typeEpis.length === 0) {
            return res.status(200).json({ message: "Aucun type d'EPI n'est présent dans la base de données" });
        }
        return res.json(typeEpis);
    } catch(error) {
        next(error);
    }
});

router.get("/:id", validateRequest("GET"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        const typeEpi = await getEpiTypeById(req);
        if (!typeEpi) {
            return res.status(404).json({
                message: `Aucun type d'EPI trouvé avec l'ID ${req.params.id}`
            });
        }
        return res.json(typeEpi);
    } catch(error) {
        next(error);
    }
});

/**
 * Route pour créer un nouveau type d'EPI
 * @route POST /type-epi
 * @returns {Response} Retourne le type d'EPI créé en JSON
 */
router.post("/", validateRequest("POST"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const typeEpi = await createEpiType(req, next, res);
        if (typeEpi) {
            res.status(201).json(typeEpi);
        } else {
            res.status(400).json({ message: "Erreur lors de la création du type d'EPI" });
        }
    } catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Une erreur est survenue"
        });
    }
});

/**
 * Route pour mettre à jour un type d'EPI
 * @route PUT /type-epi/:id
 * @returns {Response} Retourne un message de confirmation
 */
router.put("/:id", validateRequest("PUT"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateEpiType(req, res, next);
    } catch (error) {
        if (!res.headersSent) {
            next(error);
        }
    }
});

/**
 * Route pour supprimer un type d'EPI
 * @route DELETE /type-epi/:id
 * @returns {Response} Retourne un message de confirmation
 */
router.delete("/:id", validateRequest("DELETE"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteEpiType(req, next);
        res.status(200).json({ message: "Type d'EPI supprimé avec succès" });
    } catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Une erreur est survenue"
        });
    }
});

export default router;