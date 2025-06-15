import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

export async function isAuthenticated(event) {
  const token = getCookie(event, 'access_token');

  if (!token) {
    throw createError({ statusCode: 401, message: 'Authorization token missing' });
  }

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
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid or expired token' });
  }
});