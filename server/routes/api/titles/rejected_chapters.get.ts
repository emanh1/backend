import { prisma } from '@/utils/prisma';

export default defineEventHandler(async (event) => {

  const chapters = await prisma.chapter.findMany({
    where: {
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