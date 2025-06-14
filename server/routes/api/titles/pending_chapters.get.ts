import { prisma } from '@/utils/prisma';

export default defineEventHandler(async (event) => {

  const chapters = await prisma.chapter.findMany({
    where: {
      status: 'pending'
    },
    orderBy: {
      chapterNumber: 'asc'
    }
  });

  if (!chapters || chapters.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'No pending chapters found for this title'
    });
  }
  return {
    message: 'Pending chapters retrieved successfully',
    chapters: chapters
  };
});