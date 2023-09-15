import express, { Request, Response } from "express";
import { createRequest } from "../controllers/contactRequest.controller";

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const result = await createRequest(req.body)
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


export default router;