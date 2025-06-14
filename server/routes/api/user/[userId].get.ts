export default defineEventHandler(async (event) => {
  const userId = event.context.params?.userId;
  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required'
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      userId: userId
    },
    select: {
      userId: true,
      username: true,
      email: true,
      bio: true,
      avatarUrl: true,
      role: true,
      uploads: true
    }
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    });
  }

  return {
    message: 'User profile retrieved successfully',
    user: user
  };
});