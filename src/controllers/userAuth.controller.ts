import { Route, Tags, Post, Body } from "tsoa";
import { User, Company } from "../sqlz/models";
import {
  EUserStatus,
  ILoginPayload,
  IResponse,
  IUserBasicPayload,
} from "../interfaces";
import * as UserSessionController from "./userSession.controller";
import { getModelFromCollectionBase, bcrypt, jwt } from "../utils";
import { config } from "../config/config";
import { EMAIL_KEYS, sendMail } from "../services/mail";

@Route("api/v1/auth/user")
@Tags("User Auth")
export default class UserAuthController {
  @Post("/signin")
  public async signIn(@Body() auth: ILoginPayload) {
    try {
      let result: any = await User.findOne({ where: { email: auth.email } });
      result = getModelFromCollectionBase(result);
      if (result) {
        if (result.status === EUserStatus.PENDING) throw new Error('Please activate your account')
        if (result.status === EUserStatus.DECLINED) throw new Error('Your account was deleted')
        const isSame = await bcrypt.compare(auth.password, result.password);
        if (isSame) {
          const { id, email, firstname, lastname, role } = result;
          const loggedInPayload = {
            id,
            email,
            firstname,
            lastname,
            role,
          };
          const refreshToken = jwt.generateRefreshToken({ ...loggedInPayload });
          const userSessionPayload = {
            userId: id,
            token: refreshToken,
          };
          const session = await UserSessionController.create(
            userSessionPayload
          );
          const accessToken = jwt.generateAccessToken({
            ...loggedInPayload,
            sessionId: session.id,
          });
          const response: IResponse = {
            status: 200,
            data: { accessToken, refreshToken },
            message: "Successed to signin!",
          };
          return response;
        } else {
          const response: IResponse = {
            status: 400,
            error: {
              message: "Password is wrong!",
            },
          };
          return response;
        }
      } else {
        const response: IResponse = {
          status: 400,
          error: {
            message: "You are not registered!",
          },
        };
        return response;
      }
    } catch (error) {
      return { status: 400, data: null, error: { message: (error as Error).message }, message: (error as Error).message };
    }
  }

  public async forgotPassword(@Body() auth: ILoginPayload) {
    try {
      let result: any = await User.findOne({ where: { email: auth.email } });
      if (result) {
        const { id, email, firstname, lastname, role } = result;
        const loggedInPayload = {
          id,
          email,
          firstname,
          lastname,
          role,
        };
        const refreshToken = jwt.generateRefreshToken({ ...loggedInPayload });
        const userSessionPayload = {
          userId: id,
          token: refreshToken,
        };
        const session = await UserSessionController.create(
          userSessionPayload
        );
        const accessToken = jwt.generateAccessToken({
          ...loggedInPayload,
          sessionId: session.id,
        });
        const url = `${config.frontend}/set-password?token=${accessToken}`
        await sendMail({
          mail: EMAIL_KEYS.FORGOT_PWD,
          info: {
            to: [email]
          },
          data: { url }
        })
        const response: IResponse = {
          status: 200,
          message: "Please check your inbox!",
        };
        return response;
      } else {
        const response: IResponse = {
          status: 400,
          error: {
            message: "You are not registered!",
          },
        };
        return response;
      }
    } catch (error) {
      return { status: 400, data: null, error: { message: (error as Error).message } };
    }
  }

  public async setPassword(@Body() auth: ILoginPayload) {
    try {
      await User.update({ password: await bcrypt.hash(auth.password), status: EUserStatus.ACTIVE }, { where: { email: auth.email } });
      const response: IResponse = {
        status: 200,
        message: "You password was updated successfully!",
      };
      return response;
    } catch (error) {
      return { status: 400, data: null, error: { message: (error as Error).message } };
    }
  }

  @Post("/signup")
  public async signUp(@Body() auth: IUserBasicPayload) {
    try {
      const result: any = await User.findOne({ where: { email: auth.email } });
      if (result) {
        return {
          status: 400,
          data: null,
          error: {
            message: "Please use other email.",
          }
        };
      }
      const pwd = await bcrypt.hash(auth.password);
      delete auth.role;
      const company = await Company.create({
        name: 'New Company'
      });
      const user: any = await User.create({ ...auth, password: pwd, companyId: company.id, status: EUserStatus.ACTIVE });
      const response: IResponse = {
        status: 200,
        data: user,
        message: "Successed to register.",
      };
      return response;
    } catch (error: any) {
      const response: IResponse = {
        status: 400,
        error: {
          message: error.message
        },
      };
      return response;
    }
  }

  public async callback(@Body() userProfile: IUserBasicPayload) {
    try {
      let result: any = await User.findOne({
        where: { email: userProfile.email },
      });
      if (result) {
        if (result.status === EUserStatus.DECLINED) {
          const response: IResponse = {
            status: 401,
            error: {
              message: "You were declined",
            },
          };
          return response;
        }
        if (result.status === EUserStatus.PENDING) {
          const response: IResponse = {
            status: 401,
            error: {
              message: "Please activate your account",
            },
          };
          return response;
        }
      } else {
        const pwd = await bcrypt.hash(userProfile.password);
        const company = await Company.create({
          name: 'New Company'
        });
        result = await User.create({ ...userProfile, password: pwd, companyId: company.id, status: EUserStatus.ACTIVE });
      }
      const { id, email, firstname, lastname, role } = result;
      const loggedInPayload = {
        id,
        email,
        firstname,
        lastname,
        role,
      };
      const refreshToken = jwt.generateRefreshToken({ ...loggedInPayload });
      const userSessionPayload = {
        userId: id,
        token: refreshToken,
      };
      const session = await UserSessionController.create(userSessionPayload);
      const accessToken = jwt.generateAccessToken({
        ...loggedInPayload,
        sessionId: session.id,
      });
      const response: IResponse = {
        status: 200,
        data: { accessToken, refreshToken },
        message: "Successed to google auth!",
      };
      return response;
    } catch (error: any) {
      const response: IResponse = {
        status: 401,
        error: {
          message: error.message,
        },
      };
      return response;
    }
  }

  @Post("/signout")
  public async signOut(@Body() userId: number) {
    try {
      await UserSessionController.remove(userId);
      return {
        status: 200,
        error: {
          message: "Success to logout!",
        },
      };
    } catch (error: any) {
      const response: IResponse = {
        status: 400,
        error: {
          message: error.message
        },
      };
      return response;
    }
  }
}
