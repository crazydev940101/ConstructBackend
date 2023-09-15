import express from "express";
import { listModels } from "../services/azureFormRecognizer";

const router = express.Router();

router.get(
  "/extract-models",
  async (req, res, next) => {
    try{
      const modelList = await listModels();
      res.status(200).json({
        status: 'success',
        modelList,
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
