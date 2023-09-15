import express, { NextFunction, Request, Response } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { create, get, getAll, remove, syncSubscription, update } from '../controllers/subscriptionPlan.controller'
import SubscriptionResourceRouter from "./subscriptionResource.router";

const router = express.Router();

/**
 * Subscription Resource APIs
 */
router.use('/resource', SubscriptionResourceRouter)

router.post('/', isAuthenticated, async (req: Request, res: Response, _next: NextFunction) => {
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

router.put('/:id', isAuthenticated, async (req: Request, res: Response, _next: NextFunction) => {
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

router.get('/', async (_req, res) => {
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

router.get('/sync', async (_req, res) => {
  try {
    const result = await syncSubscription()
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

router.get('/:id', async (req, res) => {
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

router.delete('/:id', isAuthenticated, async (req: Request, res: Response, _next: NextFunction) => {
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
