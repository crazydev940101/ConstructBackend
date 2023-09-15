import express, { Request, Response } from "express";
import * as promptController from "../controllers/openaiPrompt.controller";

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const result = await promptController.storePrompt(req.body)
        res.status(200).json({
            data: result
        })
    } catch(err) {
        res.status(400).json({
            error: {
                message: (err as Error).message
            }
        })
    }
});

router.get('/', async (_req: Request, res: Response) => {
    try {
        const result = await promptController.getPrompts()
        res.status(200).send(result)
    } catch(err) {
        res.status(400).json({
            error: {
                message: (err as Error).message
            }
        })
    }
})

export default router;
