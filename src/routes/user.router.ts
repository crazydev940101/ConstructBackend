import express, { Request, Response } from "express";
import { addUser, declineUser, deleteUser, fetchProfile, fetchTeamMembers, getAll, inviteAgain, updateProfile, updateRole } from '../controllers/user.controller'
import { isAuthenticated, canAddUser, onlyAdmin, onlySystemAdmin } from "../middlewares";
import { jwt } from "../utils";

const router = express.Router();

/**
 * Fetch all users
 */
router.get('/', isAuthenticated, onlyAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await getAll()
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
 * Invite an user to the team of the authenticated user
 */
router.post('/', isAuthenticated, canAddUser(true), async (req: Request, res: Response) => {
  try {
    const result = await addUser(req.body)
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
 * Invite the user again
 */
router.post('/:id', isAuthenticated, onlyAdmin, async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const result = await inviteAgain(userId)
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
 * Activate the invited user
 */
router.get('/activate/:token', async (req: Request, res: Response) => {
  const token = req.params.token;
  try {
    const verifiedData = jwt.verifyAccessToken(token)
    console.log((verifiedData as any).data)

  } catch (err) {
    res.status(401).json({
      data: 'Unauthenticated',
      error: {
        message: 'Unauthenticated'
      },
    })
  }
})

/**
 * Fetch team members of the authenticated user
 */
router.get('/team-members', isAuthenticated, onlyAdmin, async (req: Request, res: Response) => {
  try {
    const result = await fetchTeamMembers((req.user as any).data.email)
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
 * Fetch profile data
 */
router.get('/profile', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const result = await fetchProfile((req.user as any).data.email)
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
 * Update member's role of team of the authenticated user
 */
router.put('/role/:id', isAuthenticated, onlyAdmin, canAddUser(false), async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  try {
    const result = await updateRole(userId, req.body.role)
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
 * Update profile
 */
router.put('/profile', isAuthenticated, async (req: Request, res: Response) => {
  const userId = Number((req.user as any).data.id);
  try {
    const result = await updateProfile(userId, req.body)
    res.status(200).json({
      data: result,
      message: 'Profile was updated successfully'
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
 * Delete authenticated user
 */
router.delete('/', isAuthenticated, async (req: Request, res: Response) => {
  const userId = Number((req.user as any).data.id);
  try {
    const result = await declineUser(userId)
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

router.delete('/forever/:id', isAuthenticated, onlySystemAdmin, async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  try {
    if(userId === (req.user as any).data.id) throw new Error('This is your account')
    const result = await deleteUser(userId)
    res.status(200).json({
      data: result,
      message: `User ${userId} was deleted successfully.`
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
 * Remove member from the team of the authenticated user
 */
router.delete('/:id', isAuthenticated, onlyAdmin, async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  try {
    if(userId === (req.user as any).data.id) throw new Error('This is your account')
    const result = await declineUser(userId)
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

export default router;
