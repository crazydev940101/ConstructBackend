import express, { Request, Response } from "express";
import { getSubscriptionList, subscribe } from "../controllers/newsletter.controller";
const router = express.Router();

/**
 * Subscribe
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const result = await subscribe(req.body)
        res.status(200).json({
            data: result,
            message: 'Subscribed successfully.'
        })
    } catch (err) {
        res.status(400).json({
            error: err
        })
    }
})

/**
 * Fetch subscriber list
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await getSubscriptionList()
        res.status(200).json({
            data: result
        })
    } catch (err) {
        res.status(400).json({
            error: err
        })
    }
})

export default router;