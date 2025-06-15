import { prisma } from '@/utils/prisma';

export default defineEventHandler(async (event) => {

  const chapters = await prisma.chapter.findMany({
    where: {
      status: 'rejected'
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
    return { message: 'No rejected chapters found' };
  }
  return {
    message: 'Rejected chapters retrieved successfully',
    chapters: chapters
  };
}
);