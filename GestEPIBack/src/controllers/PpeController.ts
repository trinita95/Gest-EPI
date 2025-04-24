import { Router, Request, Response, NextFunction } from "express";
import {
    deleteEpi,
    getAllEpis,
    getEpiById,
    createEpi,
    updateEpi,
    getEpisWithUpcomingControls
} from "../managers/PpeManager";
import { validateRequest } from "../middlewares";

const router: Router = Router();

/**
 * Route pour récupérer tous les EPI, un EPI spécifique ou des EPI avec filtres
 * @route GET /epi
 * @route GET /epi/:id
 * @route GET /epi/alerts - Pour les EPI nécessitant un contrôle
 * @returns {Response} Retourne le(s) EPI en JSON
 */
router.get("/", validateRequest("GET"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        const epis = await getAllEpis();
        if (epis.length === 0) {
            return res.status(200).json({ message: "Aucun EPI n'est présent dans la base de données" });
        }
        return res.json(epis);
    } catch(error) {
        next(error);
    }
});

router.get("/alerts", validateRequest("GET"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        const epis = await getEpisWithUpcomingControls(req);
        if (epis.length === 0) {
            return res.status(200).json({ message: "Aucun EPI ne nécessite de contrôle prochainement" });
        }
        return res.json(epis);
    } catch(error) {
        next(error);
    }
});

router.get("/:id", validateRequest("GET"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        const epi = await getEpiById(req);
        if (!epi) {
            return res.status(404).json({
                message: `Aucun EPI trouvé avec l'ID ${req.params.id}`
            });
        }
        return res.json(epi);
    } catch(error) {
        next(error);
    }
});

/**
 * Route pour créer un nouvel EPI
 * @route POST /epi
 * @returns {Response} Retourne l'EPI créé en JSON
 */
router.post("/", validateRequest("POST"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const epi = await createEpi(req, next, res);
        if (epi) {
            res.status(201).json(epi);
        } else {
            res.status(400).json({ message: "Erreur lors de la création de l'EPI" });
        }
    } catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Une erreur est survenue"
        });
    }
});

/**
 * Route pour mettre à jour un EPI
 * @route PUT /epi/:id
 * @returns {Response} Retourne un message de confirmation
 */
router.put("/:id", validateRequest("PUT"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateEpi(req, res, next);
    } catch (error) {
        if (!res.headersSent) {
            next(error);
        }
    }
});

/**
 * Route pour supprimer un EPI
 * @route DELETE /epi/:id
 * @returns {Response} Retourne un message de confirmation
 */
router.delete("/:id", validateRequest("DELETE"), async(req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("here", req);
        await deleteEpi(req, next);
        res.status(200).json({ message: "EPI supprimé avec succès" });
    } catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Une erreur est survenue"
        });
    }
});

export default router;