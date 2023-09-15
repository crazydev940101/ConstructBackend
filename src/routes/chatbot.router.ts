import express, { NextFunction, Request, Response } from "express";
import * as chatbotController from "../controllers/chatbot.controller";

const router = express.Router();

router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await chatbotController.chat({
            extraText: req.body.extraText,
            text: req.body.text,
            userId: (req.user as any).data.id
        })
        res.status(200).json({
            data: result
        })
    } catch(err) {
        console.log(err)
        res.status(400).json({
            error: {
                message: (err as Error).message
            }
        })
    }
});

router.post('/chat_v1', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await chatbotController.extractIntent({
            extraText: req.body.extraText,
            text: req.body.text,
            userId: (req.user as any).data.id
        })
        res.status(200).json({
            data: result
        })
    } catch(err) {
        console.log(err)
        res.status(400).json({
            error: {
                message: (err as Error).message
            }
        })
    }
});

router.get('/text-classifier', async (req: Request, res: Response) => {
    try {
        const result = await chatbotController.classifer(req.query.text as string)
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
