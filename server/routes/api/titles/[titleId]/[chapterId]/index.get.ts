import { prisma } from '@/utils/prisma';

export default defineEventHandler(async (event) => {

  const { titleId, chapterId } = event.context.params;

  if (!titleId || !chapterId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title ID and Chapter ID are required',
    });
  }

  const chapter = await prisma.chapter.findUnique({
    where: {
      malId: Number(titleId),
      chapterId: chapterId
    },
    include: {
      pages: true,
    },
  });

  if (!chapter) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chapter not found',
    });
  }
  return {
    message: 'Chapter retrieved successfully',
    chapter: chapter,
  };
});