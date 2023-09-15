import express, { Request, Response } from "express";
import UserAuthController from "../controllers/userAuth.controller";
import * as UserSessionController from "../controllers/userSession.controller";
import passport from "passport";
import { validateSignup } from "../middlewares/validateAuth";
import { Profile } from "passport-google-oauth";
import { IUserBasicPayload } from "../interfaces";
import { EUserRole } from "../interfaces/user";
import { string } from "../utils";
import { config } from "../config/config";
import { isAuthenticated } from "../middlewares/isAuthenticated";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/error", session: false }),
  async (_req, res) => {
    const controller = new UserAuthController();
    const userInfo = (res?.req?.user as Profile)?._json as any;
    const userProfile: IUserBasicPayload = {
      firstname: userInfo.given_name,
      lastname: userInfo.family_name,
      role: EUserRole.ADMIN,
      email: userInfo.email,
      password: string.generateRandomString(10),
    };
    const response = await controller.callback(userProfile);
    if (response.status === 200) {
      res.redirect(
        `${config.frontend}/auth?accessToken=${response?.data?.accessToken}&refreshToken=${response?.data?.refreshToken}`
      );
    } else {
      res.redirect(
        `${config.frontend}/auth?error=Failed%20authentication&errorDescription=${response.error?.message}`
      );
    }
  }
);

router.get("/azure",
  passport.authenticate("azuread-openidconnect", {
    failureRedirect: "/",
    session: false
  })
);

router.post(
  "/azure/callback",
  async (req, res, next) => {
    passport.authenticate("azuread-openidconnect", {
      failureRedirect: "/"
    })(req, res, next);
  },
  async (req, res) => {
    const controller = new UserAuthController();
    const userInfo = (res?.req?.user as Profile)?._json as any;
    const userProfile: IUserBasicPayload = {
      firstname: userInfo.name.split(' ')[0],
      lastname: userInfo.name.split(' ')[1],
      role: EUserRole.ADMIN,
      email: userInfo.preferred_username,
      password: string.generateRandomString(10),
    };
    const response = await controller.callback(userProfile);
    if (response.status === 200) {
      res.redirect(
        `${config.frontend}/auth?accessToken=${response?.data?.accessToken}&refreshToken=${response?.data?.refreshToken}`
      );
    } else {
      res.redirect(
        `${config.frontend}/auth?error=Failed%20authentication&errorDescription=${response.error?.message}`
      );
    }
  }
);

router.post("/signin", async (req, res) => {
  const controller = new UserAuthController();
  const response = await controller.signIn(req.body);
  return res.status(response.status).send(response);
});

router.post("/signup", validateSignup, async (req, res) => {
  const controller = new UserAuthController();
  const response = await controller.signUp(req.body);
  return res.status(response.status).send(response);
});

router.post("/signout", isAuthenticated, async (req, res) => {
  if (req.user, (req.user as any).data.id) {
    const userId = (req.user as any).data.id
    req.logout(async () => {
      const controller = new UserAuthController();
      const response = await controller.signOut(userId);
      return res.send(response);
    })
  } else {
    res.status(400).json({
      error: {
        message: 'Failed to signout'
      }
    })
  }
});

router.get('/', isAuthenticated, async (req, res) => {
  if (req.user) {
    const user = req.user as any;
    delete user.data.sessionId;
    try {
      await UserSessionController.checkByUserId(user.data.id)
      res.status(200).json({
        user: user.data
      })
    } catch (err: any) {
      res.status(401).json({
        error: {
          message: err.message
        }
      })
    }
  } else {
    res.status(401).json({
      error: {
        message: 'Failed to get user data'
      }
    })
  }
})

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const controller = new UserAuthController();
    const response = await controller.forgotPassword(req.body);
    res.status(response.status).send(response);
  } catch (err: any) {
    res.status(401).json({
      error: {
        message: err.message
      }
    })
  }
})

router.post('/set-password', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const controller = new UserAuthController();
    const response = await controller.setPassword({
      email: (req.user as any)?.data?.email,
      password: req.body.password
    });
    res.status(response.status).send(response);
  } catch (err: any) {
    res.status(401).json({
      error: {
        message: err.message
      }
    })
  }
})

export default router;
