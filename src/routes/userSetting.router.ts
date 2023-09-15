import express, { Request, Response } from "express";
import { isAuthenticated } from "../middlewares";
import { fetchNotificationSetting, notificationSetting } from "../controllers/userSetting.controller";
import { EUserSettingEmailNotificationOptions } from "../interfaces";

const router = express.Router();

router.get('/email', isAuthenticated, async(req: Request, res: Response) => {
  try {
    const result = await fetchNotificationSetting((req.user as any).data.id)
    res.status(200).json({
      data: result
    })
  } catch(err) {
    res.status(400).json({
      error: {
        message: (err as Error).message
      }
    })
  }
})

router.put('/email/:value', isAuthenticated, async(req: Request, res: Response) => {
  try {
    const value = req.params.value as EUserSettingEmailNotificationOptions;
    if(!(Object.values(EUserSettingEmailNotificationOptions)).includes(value)) {
      res.status(404).json({
        error: {
          message: "Invalid value"
        }
      })
      return
    }
    const result = await notificationSetting((req.user as any).data.id, value)
    res.status(200).json({
      data: result,
      message: 'Email notification setting was updated successfully'
    })
  } catch(err) {
    res.status(400).json({
      error: {
        message: (err as Error).message
      }
    })
  }
})

export default router;