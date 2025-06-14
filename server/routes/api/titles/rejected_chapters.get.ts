import { prisma } from '@/utils/prisma';

export default defineEventHandler(async (event) => {
  const titleId = event.context.params?.titleId;
  if (!titleId) {
    throw createError({
      statusCode: 400,
      message: 'Title ID is required'
    });
  }

  const chapters = await prisma.chapter.findMany({
    where: {
      malId: Number(titleId),
      status: 'rejected'
    },
    orderBy: {
      chapterNumber: 'asc'
    }
  });

  if (!chapters || chapters.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'No rejected chapters found for this title'
    });
  }
  return {
    message: 'Rejected chapters retrieved successfully',
    chapters: chapters
  };
}
);