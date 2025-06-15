import { isAuthenticated } from '@/utils/auth';

export default defineEventHandler(async (event) => {
  await isAuthenticated(event);
  const user = event.context.user;

  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }
  return {
    message: 'User profile retrieved successfully',
    user: user,
  };
});
