import express, { Request, Response } from "express";
import { search } from '../controllers/search.controller'
import { isAuthenticated } from "../middlewares";
const router = express.Router();

/**
 * Subscribe
 */
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const result = await search(
            req.query.text as string,
            (req.user as any).data.id,
            req.query.resource as string || null
        )
        res.status(200).json(result)
    } catch (err) {
        res.status(400).json({
            error: {
                message: (err as Error).message
            }
        })
    }
})

export default router