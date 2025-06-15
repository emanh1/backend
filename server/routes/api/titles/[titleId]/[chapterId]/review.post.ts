import { isAdmin } from '@/utils/auth';
import { prisma } from '@/utils/prisma';

interface ReviewQuery {
  status: string;
  reason?: string;
}

export default defineEventHandler(async (event) => {
  await isAdmin(event);
  const { titleId, chapterId } = event.context.params;
  const query: ReviewQuery = getQuery(event);
  const status = query.status;
  const reason = query.reason;

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
  if (status !== 'approved' && status !== 'rejected') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid approval status. Use "status=approved" or "status=rejected".',
    });
  }

  if (status === 'approved') {
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
        status: 'rejected',
        rejectionReason: reason || 'No reason provided'
      }
    });
  }
  return {
    chapter: {
      id: chapter.chapterId,
      status: chapter.status,
      rejectionReason: chapter.rejectionReason
    }
  };
} 
);