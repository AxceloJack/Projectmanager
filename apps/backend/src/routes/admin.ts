import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { AuthRequest } from '../types/index.js';
import { isAdminEmail } from '../config/admins.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Check if user is admin
const adminMiddleware = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user || (user.role !== 'ADMIN' && !isAdminEmail(user.email))) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization failed' });
  }
};

// Get all pending users
router.get('/users/pending', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    console.log('Fetching pending users for workspace:', req.user!.workspaceId);
    const pendingUsers = await prisma.user.findMany({
      where: {
        workspaceId: req.user!.workspaceId,
        approved: false,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log('Found pending users:', pendingUsers);
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ error: 'Failed to fetch pending users' });
  }
});

// Approve a user
router.post('/users/:userId/approve', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        workspaceId: req.user!.workspaceId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const approvedUser = await prisma.user.update({
      where: { id: userId },
      data: { approved: true },
      select: {
        id: true,
        email: true,
        role: true,
        approved: true,
      },
    });

    res.json(approvedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});

// Reject/delete a user
router.post('/users/:userId/reject', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        workspaceId: req.user!.workspaceId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ success: true, message: 'User rejected and deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reject user' });
  }
});

export default router;
