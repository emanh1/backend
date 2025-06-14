import authMiddleware from '@/utils/auth';

export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  const user = event.context.user;

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }
  return {
    message: 'User profile retrieved successfully',
    user: user,
  };
});
