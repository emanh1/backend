import { z } from 'zod';
import { generateToken } from '@/utils/auth';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters long")
});

export default defineEventHandler(async (event) => {

  const body = await readBody(event);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.errors[0]?.message || 'Invalid form submission'
    });
  }
  const data = parsed.data;
  const user = await prisma.user.findUnique({
    where: {
      username: data.username
    }
  });
  if (!user) {
    throw createError({
      statusCode: 400,
      message: 'Username or password is incorrect'
    });
  }

  if (!comparePasswords(data.password, user.password)) {
    throw createError({
      statusCode: 400,
      message: 'Username or password is incorrect'
    });
  }

  const token = await generateToken(user.userId);

  return {
    message: 'Login successful',
    user: {
      userId: user.userId,
      email: user.email,
      username: user.username
    },
    token: token
  };
});