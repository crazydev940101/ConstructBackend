import express, { Request, Response } from "express";
import { isAuthenticated, onlySystemAdmin } from "../middlewares";
import {
  createPlan,
  getAllRequests,
  getDetail,
  getPendingRequest,
  requestSale
} from "../controllers/saleRequest.controller";

const router = express.Router();

router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const result = await requestSale(req.body, (req.user as any).data.id)
    res.status(200).json({
      data: result,
      message: 'Request was submitted successfully'
    })
  } catch (err) {
    res.status(400).json({
      error: {
        message: (err as Error).message
      }
    })
  }
})

router.post('/:id', isAuthenticated, onlySystemAdmin, async (req: Request, res: Response) => {
  try {
    const result = await createPlan({
      ...req.body,
      id: Number(req.params.id)
    })
    res.status(200).json({
      data: result,
      message: 'Subscription was created and user got the link successfully.'
    })
  } catch (err) {
    res.status(400).json({
      error: {
        message: (err as Error).message
      }
    })
  }
})

router.get('/pending', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const result = await getPendingRequest((req.user as any).data.id)
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

router.get('/:id', isAuthenticated, onlySystemAdmin, async (req: Request, res: Response) => {
  try {
    const result = await getDetail(Number(req.params.id))
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

router.get('/', isAuthenticated, onlySystemAdmin, async (req: Request, res: Response) => {
  try {
    const result = await getAllRequests()
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