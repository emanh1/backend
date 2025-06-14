import { prisma } from '@/utils/prisma';

export default defineEventHandler(async (event) => {
  const { titleId, chapterId } = event.context.params;
  const query = getQuery(event);
  const approve = query.approve;

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
    }
  });

  if (!chapter) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chapter not found',
    });
  }
  if (chapter.status !== 'pending') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Chapter is not pending for review',
    });
  }
  if (approve !== 'true' && approve !== 'false') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid approval status. Use "approve=true" or "approve=false".',
    });
  }

  if (approve) {
    await prisma.chapter.update({
      where: {
        chapterId: chapter.chapterId
      },
      data: {
        status: 'approved'
      }
    });
  } else {
    await prisma.chapter.update({
      where: {
        chapterId: chapter.chapterId
      },
      data: {
        status: 'rejected'
      }
    });
  }
  return {
    message: `Chapter ${approve ? 'approved' : 'rejected'} successfully`,
    // return updated chapter?
  };
} 
);