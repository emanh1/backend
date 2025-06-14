import { prisma } from '@/utils/prisma';

export default defineEventHandler(async (event) => {
  const userId = event.context.params.userId;
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    });
  }

  const uploads = await prisma.chapter.findMany({
    where: {
      uploaderId: userId
    }
  });

  return {
    message: 'Uploads retrieved successfully',
    uploads: uploads
  }
});