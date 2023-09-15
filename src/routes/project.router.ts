import express, { Request, Response } from "express";
import { isAuthenticated, isAuthenticatedWithQuery } from "../middlewares/isAuthenticated";
import {
  create,
  download,
  extract,
  get,
  getList,
  getListWithCompanyId,
  getResource,
  remove,
  update
} from '../controllers/project.controller'
import {
  checkCompanyId,
  checkRoleForExtract,
  checkSubscriptionForExtract
} from "../middlewares/extractDataMiddlewares";
import { EInsightInventoryType, TInventoryTypeWithSupplier } from "../interfaces/project";

const router = express.Router();

router.post('/',
  isAuthenticated,
  checkRoleForExtract,
  checkSubscriptionForExtract,
  async (req: Request, res: Response) => {
    try {
      const result = await create(req.body)
      res.status(200).json({
        data: result
      })
    } catch (err) {
      res.status(400).json({
        error: err
      })
    }
  })

router.put('/:id',
  isAuthenticated,
  checkRoleForExtract,
  async (req: Request, res: Response) => {
    try {
      const id: number = Number(req.params.id);
      const result = await update(id, req.body);
      res.status(200).json({
        data: result
      })
    } catch (err) {
      res.status(400).json({
        error: err
      })
    }
  })

router.get('/all', isAuthenticated, async (_req: Request, res: Response) => {
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

router.get('/', isAuthenticated, checkCompanyId, async (req: Request, res: Response) => {
  try {
    const result = await getListWithCompanyId(req.body.companyId, (req.user as any).data.role)
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

router.delete('/:id',
  isAuthenticated,
  checkRoleForExtract,
  async (req: Request, res: Response) => {
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

router.get('/extract/:id',
  isAuthenticated,
  checkRoleForExtract,
  checkSubscriptionForExtract,
  async (req: Request, res: Response) => {
    try {
      const id: number = Number(req.params.id);
      const companyId: number = Number(req.body.companyId);
      const result = await extract(id, companyId, (req.user as any).data.id, req.headers.authorization as string);
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
 * Get resource data with resourceId(blobName)
 */
router.get('/resource/:id',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const result = await getResource(id);
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
 * Download Extracted Data List of a specific project(with projectId)
 */
router.get('/download/:projectId', isAuthenticatedWithQuery, async (req: Request, res: Response) => {
  Number(req.params.projectId), null, (req.user as any).data.id
  const { buffer, filename } = await download({
    projectId: Number(req.params.projectId),
    userId: (req.user as any).data.id
  })
  res.writeHead(200, {
    "Content-Type": "application/octet-stream",
    "Content-disposition": `attachment; filename=${filename}`,
  })
  res.end(buffer)
})

/**
 * Download a Extracted Data(with extractDataId)
 */
router.get('/download/extractedData/:extractedDataId', isAuthenticatedWithQuery, async (req: Request, res: Response) => {
  const { buffer, filename } = await download({
    extractDataId: Number(req.params.extractedDataId),
    userId: (req.user as any).data.id
  })
  res.writeHead(200, {
    "Content-Type": "application/octet-stream",
    "Content-disposition": `attachment; filename=${filename}`,
  })
  res.end(buffer)
})

/**
 * Download inventories of a delivery ticket project(with projectId) per category(material, tools, plant, ppe, and supplier)
 */
router.get('/download/insight/:category/:projectId', isAuthenticatedWithQuery, async (req: Request, res: Response) => {
  const { buffer, filename } = await download({
    projectId: Number(req.params.projectId),
    userId: (req.user as any).data.id,
    inventoryType: (req.params.category as TInventoryTypeWithSupplier)
  })
  res.writeHead(200, {
    "Content-Type": "application/octet-stream",
    "Content-disposition": `attachment; filename=${filename}`,
  })
  res.end(buffer)
})

export default router;
