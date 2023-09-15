import express, { Request, Response } from "express";
import { isAuthenticated, onlySystemAdmin } from "../middlewares/isAuthenticated";
import { create, download, downloadToJson, get, getList, remove } from '../controllers/extractData.controller'
import { checkRoleForExtract, checkSubscriptionForExtract } from "../middlewares/extractDataMiddlewares";

const router = express.Router();

/**
 * Create ExtractData
 */
router.post('/',
  isAuthenticated,
  checkRoleForExtract,
  checkSubscriptionForExtract, async (req: Request, res: Response) => {
    try {
      if (!req.files) {
        res.status(400).json({
          error: {
            message: 'Please upload documents'
          }
        })
        return;
      }
      if (!req.body.projectId) {
        res.status(400).json({
          error: {
            message: 'Please choose project'
          }
        })
        return;
      }
      const result = await create(req.files, req.body.projectId)
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

/**
 * Get ExtractData detail with id
 */
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

/**
 * Get ExtractData list
 */
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

/**
 * Delete extractData with id
 */
router.delete('/:id', isAuthenticated, checkRoleForExtract, async (req: Request, res: Response) => {
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

/**
 * Download original file with extractData id
 */
router.get('/file/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const id: number = Number(req.params.id);
    download(id, res);
  } catch (err) {
    res.status(400).json({
      error: {
        message: (err as Error).message
      }
    })
  }
})

/**
 * Download as JSON File with extractData id
 */
router.get('/json/:id', isAuthenticated, onlySystemAdmin, async (req: Request, res: Response) => {
  try {
    const id: number = Number(req.params.id);
    await downloadToJson(id, res);
  } catch (err) {
    res.status(400).json({
      error: {
        message: (err as Error).message
      }
    });
  }
});


export default router;
