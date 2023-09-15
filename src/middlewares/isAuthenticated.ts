import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { User } from "../sqlz/models";
import { EUserRole } from "../interfaces";
import { jwt } from "../utils";

export const isAuthenticated = passport.authenticate('jwt', {session: false})

export const isAuthenticatedWithQuery = (req: Request, res: Response, next: NextFunction) => {
    try {
        const verifiedData = jwt.verifyAccessToken(`${req.query.token}`)
        if(!verifiedData) throw new Error('Unauthenticated Token');
        req.user = verifiedData
        next()
    } catch(err) {
        res.status(401).json({
            error: {
                message: (err as Error).message
            }
        })
    }
}

export const onlyAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findOne({ where: { id: (req.user as any).data.id } })
        if (!user) throw new Error('Unauthenticated')
        if (user.role !== EUserRole.VIEWER && user.role !== EUserRole.CONTRIBUTOR) {
            next();
            return
        }
        throw new Error("You don't have permission to access to this resource")
    } catch (err) {
        res.status(401).json({
            status: 'failed',
            error: {
                message: (err as Error).message
            }
        })
    }
}

export const onlySystemAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findOne({ where: { id: (req.user as any).data.id } })
        if (!user) throw new Error('Unauthenticated')
        if (user.role === EUserRole.SYSTEM_ADMIN) {
            next();
            return
        }
        throw new Error("You don't have permission to access to this resource")
    } catch (err) {
        res.status(401).json({
            status: 'failed',
            error: {
                message: (err as Error).message
            }
        })
    }
}