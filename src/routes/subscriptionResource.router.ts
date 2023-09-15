import express, { NextFunction, Request, Response } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { create, get, getAll, remove, update } from '../controllers/subscriptionResource.controller'

const router = express.Router();

router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const result = await create(req.body)
    res.status(200).json({
      data: result
    })
  } catch (err) {
    res.status(400).json({
      error: {
        message: (err as Error).message
      }
    })
  }
})

router.put('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id: number = Number(req.params.id);
    const result = await update(id, req.body);
    res.status(200).json({
      data: result
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
      data: result
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
    const id: number = Number(req.params.id);
    const result = await get(id)
    res.status(200).json({
      data: result
    })
  } catch (err) {
    res.status(400).json({
      error: {
        message: (err as Error).message
      }
    })
  }
})

router.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id: number = Number(req.params.id);
    const result = await remove(id);
    res.status(200).json({
      data: result
    })
  } catch (err) {
    res.status(400).json({
      error: {
        message: (err as Error).message
      }
    })
  }
})

export default router;
