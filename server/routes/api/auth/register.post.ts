import { z } from 'zod';
import { hashPassword } from '@/utils/auth';

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  username: z.string().min(1, "Username is required")
});

export default defineEventHandler(async (event) => {

  const body = await readBody(event);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.errors[0]?.message || 'Invalid form submission'
    });
  }
  const data = parsed.data;
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email
    }
  });
  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: 'Email already registered'
    });
  }
  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: await hashPassword(data.password),
    }
  });

  return {
    message: 'User registered successfully',
    user: {
      userId: user.userId,
      email: user.email,
      username: user.username,
    }
  };
});