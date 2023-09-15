import express, { NextFunction, Request, Response } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated";
import { create, get, getAll, getList, remove, update, updateStatus } from '../controllers/extractModel.controller'

const router = express.Router();

router.post('/', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

router.put('/:status/:id', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id: number = Number(req.params.id);
    const status: string = req.params.status;
    console.log(status)
    if (status !== 'enabled' && status !== 'disabled') {
      res.status(404).json({
        error: {
          message: 'Not found'
        }
      })
      return
    }
    const result = await updateStatus(id, status === 'enabled')
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

router.put('/:id', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

router.get('/all', async (req, res) => {
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

router.get('/', async (req, res) => {
  try {
    const result = await getList()
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

router.delete('/:id', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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
