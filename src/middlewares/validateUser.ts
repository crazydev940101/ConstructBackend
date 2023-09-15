import { NextFunction, Request, Response } from "express";
import { User, Company } from "../sqlz/models";
import { EUserRole } from "../interfaces/user";
import { isValidatedEmail } from "../utils";

/**
 * Middleware for add and update user
 * @param {boolean} update // if it is true, update, if it is false, create
 * @returns 
 */
export const canAddUser = (create: boolean) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const writer = await User.findOne({
                where: { email: (req.user as any).data.email },
                include: {
                    model: Company,
                    as: 'company'
                }
            });
            if (!writer) throw new Error('Unauthenticated');
            const newRole = req.body.role;
            // check new role
            if (!Object.values(EUserRole).includes(newRole)) throw new Error('Invalid user role');
            // check email
            if (create) {
                if (!req.body.email) throw new Error('Email is required');
                if (!isValidatedEmail(req.body.email)) throw new Error('Invalid email');
                // check company
                req.body.companyId = writer.company.id
            }
            let currentUser
            if(!create) {
                // check user id, user can't update self roel
                if(req.params.id === (req.user as any).data.id) throw new Error('Invalid user role')
                currentUser = await User.findByPk(req.params.id)
                if(!currentUser) throw new Error('Invalid user')
                // check company of user
                if(currentUser.companyId !== writer.companyId) throw new Error('Invalid user role')
            }
            // check role of writer
            if (writer.role === EUserRole.SYSTEM_ADMIN) {
                next();
                return;
            }
            // check new role
            if (newRole === EUserRole.SYSTEM_ADMIN) throw new Error('Invalid user role');
            // check current role
            if(!create && currentUser?.role === EUserRole.SYSTEM_ADMIN) throw new Error('Invalid user role');
            // check role of writer
            if (writer.role === EUserRole.SUPER_ADMIN) {
                next();
                return;
            }
            // check new role
            if (newRole === EUserRole.SUPER_ADMIN) throw new Error('Invalid user role');
            // check current role
            if(!create && currentUser?.role === EUserRole.SUPER_ADMIN) throw new Error('Invalid user role');
            // check role of writer
            if (writer.role === EUserRole.ADMIN) {
                next();
                return;
            }
            throw new Error('Invalid user role')
        } catch (err) {
            res.status(401).json({
                status: 'failed',
                error: {
                    message: (err as Error).message
                }
            })
        }
    }
}
