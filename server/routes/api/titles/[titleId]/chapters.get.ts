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
      malId: Number(titleId)
    },
    orderBy: {
      chapterNumber: 'asc'
    }, include: {
      uploader: { 
        select: { userId: true, username: true }
      }
    }
  });

  if (!chapters || chapters.length === 0) {
    return {
      message: 'No uploaded chapters found for this title',
      chapters: []
    }
  }
  return {
    message: 'Chapters retrieved successfully',
    chapters: chapters
  }
}
);