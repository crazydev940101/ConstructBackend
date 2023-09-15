import express, { Request, Response } from "express";
import { getAll, get, create, update, remove } from "../controllers/ceFactor.controller";
import { User } from "../sqlz/models";

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        if(!req.body.companyId) {
            const user = await User.findByPk((req.user as any).data.id)
            if(!user) throw new Error('Unauthenticated user');
            req.body.companyId = user.companyId
        }
        const result = await create(req.body)
        res.status(200).json({
            data: result,
            message: `Carbon Emission Factor ${req.body.sKey} was created successfully.`
        })
    } catch (err) {
        res.status(400).json({
            error: {
                message: (err as Error).message
            }
        })
    }
})

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const result = await update({...req.body, id: req.params.id})
        res.status(200).json({
            data: result,
            message: `Carbon Emission Factor ${req.body.sKey} was updated successfully.`
        })
    } catch (err) {
        res.status(400).json({
            error: {
                message: (err as Error).message
            }
        })
    }
})

router.get('/', async (_req: Request, res: Response) => {
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

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const result = await get(Number(req.params.id))
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

router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const result = await remove(Number(req.params.id))
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
