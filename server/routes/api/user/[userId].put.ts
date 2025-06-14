import { z } from 'zod';
import jwt from 'jsonwebtoken';

const { verify } = jwt;

const updateUserSchema = z.object({
  username: z.string().min(1).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

export default defineEventHandler(async (event) => {
  const userId = event.context.params?.userId;
  if (!userId) {
    throw createError({ statusCode: 400, message: 'User ID is required' });
  }

  const authHeader = event.node.req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  let decoded;
  try {
    decoded = verify(token, process.env.JWT_SECRET);
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid token' });
  }

  if (decoded.userId !== userId) {
    throw createError({ statusCode: 403, message: 'Forbidden: cannot edit other user profiles' });
  }

  const body = await readBody(event);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: parsed.error.errors[0]?.message || 'Invalid data' });
  }

  const updatedUser = await prisma.user.update({
    where: { userId: userId },
    data: parsed.data,
    select: {
      userId: true,
      username: true,
      email: true,
      bio: true,
      avatarUrl: true,
      role: true,
    },
  });

  return {
    message: 'User profile updated successfully',
    user: updatedUser,
  };
});
