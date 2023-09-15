import { bcrypt, jwt, string as str } from "../utils";
import { User, Company, UserSession, UserSetting, SaleRequest, SubscriptionPlan, SubscriptionResource, ContactRequest, Newsletter } from "../sqlz/models";
import { EUserRole, EUserStatus, INewUser } from "../interfaces/user";
import * as UserSessionController from "./userSession.controller";
import { Op } from "sequelize";
import { EMAIL_KEYS, sendMail } from "../services/mail";
import { config } from "../config/config";
import { IResponse } from "../interfaces";

export async function addUser(params: INewUser): Promise<IResponse> {
  try {
    const result: any = await User.findOne({ where: { email: params.email } });
    if (result) throw new Error('Please use other email')
    const pwd = await bcrypt.hash(str.generateRandomString(5));
    const user: any = await User.create({
      email: params.email,
      password: pwd,
      role: params.role,
      companyId: params.companyId,
      status: EUserStatus.PENDING
    });
    const { id, email, firstname, lastname, role } = user;
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
      mail: EMAIL_KEYS.VALIDATE_EMAIL,
      info: {
        to: [email]
      },
      data: { url }
    })
    return {
      status: 200,
      message: "Invitation was sent successfully!"
    }
  } catch (error: any) {
    throw error
  }
}

/**
 * Get user list
 *
 * @returns {Promise<User[]>}
 */
export async function getAll(): Promise<User[]> {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Company,
          as: 'company'
        }
      ]
    });
    return users;
  } catch (err) {
    throw err;
  }
}

export async function fetchTeamMembers(email: string): Promise<User[]> {
  const user = await User.findOne({ where: { email } })
  if (!user) throw new Error('Unregistered User')
  const users = await User.findAll({
    where:
    {
      companyId: user.companyId,
      status: { [Op.not]: EUserStatus.DECLINED },
      role: { [Op.not]: EUserRole.SYSTEM_ADMIN }
    },
    attributes: ['id', 'firstname', 'lastname', 'role', 'email', 'status'],
    order: ['id']
  });
  return users;
}

export async function fetchProfile(email: string): Promise<User> {
  const user = await User.findOne({
    where: { email },
    attributes: ['firstname', 'lastname', 'jobTitle', 'email', 'id', 'role'],
    include: [
      {
        model: Company,
        as: 'company',
        attributes: ['name']
      }
    ]
  })
  if (!user) throw new Error('Unregistered User')
  return user;
}

export async function inviteAgain(userId: number) {
  const result: any = await User.findByPk(userId);
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
      mail: EMAIL_KEYS.VALIDATE_EMAIL,
      info: {
        to: [email]
      },
      data: { url }
    })
    return {
      status: 200,
      message: "Invitation was sent successfully!"
    }
  } else {
    throw new Error('Unregistered User')
  }
}

export async function updateRole(userId: number, role: EUserRole) {
  await User.update({ role }, { where: { id: userId } });
  return {
    message: 'User role was updated successfully'
  }
}

export async function updateProfile(userId: number, user: any) {
  const u = await User.findOne({ where: { id: userId } })
  if (!u) throw new Error('Unregistered User');
  await User.update({
    firstname: user.firstname,
    lastname: user.lastname,
    jobTitle: user.jobTitle
  }, { where: { id: userId } });
  if (u.role === EUserRole.SYSTEM_ADMIN || u.role === EUserRole.SUPER_ADMIN) {
    if (user.company) {
      await Company.update({ name: user.company.name }, { where: { id: u.companyId } })
    }
  }
  return await fetchProfile(u.email)
}

export async function declineUser(userId: number) {
  await User.update({ status: EUserStatus.DECLINED }, { where: { id: userId } });
  return {
    message: 'User was deleted successfully'
  }
}

export async function deleteUser(id: number) {
  await UserSession.destroy({ where: { userId: id } })
  await UserSetting.destroy({ where: { userId: id } })
  await SaleRequest.destroy({ where: { userId: id } })
  await ContactRequest.destroy({ where: { userId: id } })
  await Newsletter.destroy({ where: { userId: id } })
  const u = await User.destroy({ where: { id } })
  return u
}