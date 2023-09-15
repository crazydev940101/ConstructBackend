import express, { Request, Response } from "express";
import { getAll, getByKey, store } from "../controllers/systemSetting.controller";

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const result = await store(req.body)
        res.status(200).json({
            data: result,
            message: `Setting ${req.body.sKey} was updated successfully.`
        })
    } catch (err) {
        res.status(400).json({
            error: {
                message: (err as Error).message
            }
        })
    }
})

router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await getAll()
        res.status(200).json({
            data: result,
        })
    } catch (err) {
        res.status(400).json({
            error: {
                message: (err as Error).message
            }
        })
    }
})

router.get('/:key', async (req: Request, res: Response) => {
    try {
        const result = await getByKey(req.params.key)
        res.status(200).json({
            data: result,
        })
    } catch (err) {
        res.status(400).json({
            error: {
                message: (err as Error).message
            }
        })
    }
})

export default router
