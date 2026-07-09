import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../types/index.js';

const router = Router();
const prisma = new PrismaClient();

interface RegisterBody {
  email: string;
  password: string;
  workspaceName: string;
}

interface LoginBody {
  email: string;
  password: string;
}

router.post('/register', async (req, res: Response) => {
  try {
    const { email, password, workspaceName } = req.body as RegisterBody;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const workspaceSlug = workspaceName.toLowerCase().replace(/\s+/g, '-') + '-' + uuidv4().slice(0, 8);

    // Create workspace first
    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug: workspaceSlug,
      },
    });

    // Then create user with workspace reference
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        workspaceId: workspace.id,
        role: 'MEMBER',
        approved: false,
      },
    });

    // Update workspace to set owner
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspace.id },
      data: { ownerId: user.id },
      include: { owner: true },
    });

    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval.',
      workspace: updatedWorkspace,
    });
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    res.status(500).json({ error: errorMessage });
  }
});

router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body as LoginBody;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { workspace: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.approved) {
      return res.status(403).json({ error: 'Your account is pending admin approval' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        workspaceId: user.workspaceId,
        email: user.email,
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    res.json({ token, workspace: user.workspace });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/refresh', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = jwt.sign(
    {
      userId: req.user.userId,
      workspaceId: req.user.workspaceId,
      email: req.user.email,
    },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

  res.json({ token });
});

export default router;
