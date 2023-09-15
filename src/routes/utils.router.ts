import express, { NextFunction, Request, Response } from "express";
import DBUtilsController from "../controllers/dbUtils.controller";
import { extractTextFromPdf } from "../services/pdf";

const router = express.Router();

const dbUtilsController = new DBUtilsController()

router.get(
  "/migrate",
  async (_req: Request, res: Response, _next: NextFunction) => {
    try{
      const result = await dbUtilsController.migrate()
      res.status(200).json({
        status: 'success',
        data: result
      })
    } catch(err: any) {
      res.status(400).json({
        status: 'failed',
        error: {
          message: err.message
        }
      })
    }
  }
);

router.get(
  "/seed",
  async (_req: Request, res: Response, _next: NextFunction) => {
    try{
      const result = await dbUtilsController.seed()
      res.status(200).json({
        status: 'success',
        data: result
      })
    } catch(err: any) {
      res.status(400).json({
        status: 'failed',
        error: {
          message: err.message
        }
      })
    }

  }
);

router.post(
  "/extract-pdf",
  async (req: Request, res: Response, _next: NextFunction) => {
    try{
      if(!req.files) throw new Error('File is required.');
      const result = await extractTextFromPdf(req.files.file);
      res.status(200).json({
        status: 'success',
        data: result
      })
    } catch(err: any) {
      res.status(400).json({
        status: 'failed',
        error: {
          message: err.message
        }
      })
    }

  }
);

export default router;
