import { UserSession } from "../sqlz/models";
import ErrorType from "../constants/ErrorType";
import ForbiddenError from "../exceptions/ForbiddenError";
import { ISessionDetailPayload, ISessionPayload } from "../interfaces";
import { getModelFromCollectionBase, object } from "../utils";

/**
 * Insert user from given user payload.
 *
 * @param {ISessionPayload} params
 * @returns {Promise<ISessionDetailPayload>}
 */
export async function create(
  params: ISessionPayload
): Promise<ISessionDetailPayload> {
  const existingSession: any = await UserSession.findOne({
    where: {
      userId: params.userId,
    },
  });
  if (existingSession) {
    await UserSession.destroy({
      where: {
        userId: params.userId,
      },
    });
  }
  let session: any = await UserSession.create({
    userId: params.userId,
    token: params.token,
    isActive: true,
  });
  session = getModelFromCollectionBase(session);
  return object.camelize(session);
}

/**
 * check user session with userId.
 *
 * @param {number} userId
 * @returns {Promise<ISessionDetailPayload>}
 */
export async function checkByUserId(userId: number): Promise<ISessionDetailPayload> {
  try {
    const session: any = await UserSession.findOne({ where: { userId, isActive: true } });
    if(session) {
      return session
    } else {
      throw new Error('Session was expired')
    }
  } catch (err: any) {
    if (err.message === ErrorType.NO_ROWS_UPDATED_ERROR) {
      throw new ForbiddenError("Session not maintained");
    }
    throw err;
  }
}

/**
 * Deactivate user session.
 *
 * @param {string} userId
 * @returns {Promise<ISessionDetailPayload>}
 */
export async function remove(userId: number): Promise<ISessionDetailPayload> {
  try {
    const session: any = await UserSession.update(
      { isActive: false },
      { where: { userId, isActive: true } }
    );
    return object.camelize(session);
  } catch (err: any) {
    if (err.message === ErrorType.NO_ROWS_UPDATED_ERROR) {
      throw new ForbiddenError("Session not maintained");
    }
    throw err;
  }
}
