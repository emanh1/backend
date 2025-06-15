import { prisma } from '@/utils/prisma';

export default defineEventHandler(async (event) => {

  const chapters = await prisma.chapter.findMany({
    where: {
      status: 'pending'
    },
    orderBy: {
      chapterNumber: 'asc'
    },
    include: {
      uploader: {
        select: {
          userId: true,
          username: true,
        }
      }
    }
  });

  if (!chapters || chapters.length === 0) {
    return { message: 'No pending chapters found' };
  }
  return {
    message: 'Pending chapters retrieved successfully',
    chapters: chapters
  };
});