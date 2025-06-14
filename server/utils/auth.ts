import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateToken(userId: string): Promise<string> {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
}

import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, message: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    if (!decoded.userId) {
      throw new Error('Invalid token payload');
    }

    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      select: {
        userId: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        role: true,
      },
    });

    if (!user) {
      throw createError({ statusCode: 401, message: 'User not found' });
    }

    event.context.user = user;
  } catch (err) {
    throw createError({ statusCode: 401, message: 'Invalid or expired token' });
  }
});