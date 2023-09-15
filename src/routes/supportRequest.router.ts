import express, { Request, Response } from "express";
import { addNewIssue } from "../controllers/supportRequest.controller";
import { isAuthenticated } from "../middlewares";

const router = express.Router();

router.post('/', isAuthenticated, async (req: Request, res: Response) => {
    try {
        const result = await addNewIssue(req.body)
        res.status(200).json({
            data: result,
            message: 'Support was requested successfully'
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