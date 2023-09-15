import { Request, Response, NextFunction } from "express";
import { IResponse } from "../interfaces";

/**
 * A middleware to validate the post.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export async function validateSignup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.body.email || !req.body.password) {
      const response: IResponse = {
        status: 400,
        error: {
          message: "Failed to validate data. Please enter email and password",
        },
      };
      res.status(response.status).send(response);
      return
    }
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(req.body.email)) {
      res
        .status(400)
        .send({
          status: 400,
          error: {
            message: "Email is not validated.",
          },
        });
      return;
    }
    next();
  } catch (err) {
    const response: IResponse = {
      status: 400,
      error: {
        message: "Failed to validate the post data.",
      },
    };
    res.status(response.status).send(response);
  }
}
