import { readFiles } from 'h3-formidable';
import { z } from 'zod';
import { create } from 'kubo-rpc-client';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/utils/prisma';

const uploadSchema = z.object({
  malId: z.number().min(1, "MalID is required"),
  language: z.string().min(2, "Language is required"),
  volume: z.number().optional().nullable(),
  chapterNumber: z.number().optional().nullable(),
  chapterTitle: z.string().optional().nullable(),
  isOneshot: z.boolean().optional().default(false),
  uploaderId: z.string().min(1, "User ID is required"),
  ipfsNodeUrl: z.string().url().optional()
});

const allowedMime = ['image/jpeg', 'image/png', 'image/gif'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

function isValidFile(file: { filepath: string; originalFilename: string; mimetype: string }) {
  const ext = path.extname(file.originalFilename).toLowerCase();
  return allowedMime.includes(file.mimetype) && allowedExtensions.includes(ext);
}

async function uploadFilesToIPFS(
  files: { filepath: string; originalFilename: string }[],
  nodeUrl = 'http://localhost:5001/api/v0'
) {
  const client = create({ url: nodeUrl });
  const cids: string[] = [];

  for (const file of files) {
    const stream = fs.createReadStream(file.filepath);
    const { cid } = await client.add({ content: stream });
    cids.push(cid.toString());
  }

  return cids;
}

export default defineEventHandler(async (event) => {
  const { fields, files } = await readFiles(event);
  const parsedBody = {
    malId: Number(fields.malId?.[0]),
    language: fields.language?.[0],
    volume: fields.volume?.[0] ? Number(fields.volume[0]) : null,
    chapterNumber: fields.chapterNumber?.[0] ? Number(fields.chapterNumber[0]) : null,
    chapterTitle: fields.chapterTitle?.[0] || null,
    isOneshot: fields.isOneshot?.[0] === 'true',
    uploaderId: fields.uploaderId?.[0],
    ipfsNodeUrl: fields.ipfsNodeUrl?.[0] || undefined
  };

  const parsed = uploadSchema.safeParse(parsedBody);
  if (!parsed.success) {
    Object.keys(files).forEach(key => files[key]?.forEach(file => fs.unlink(file.filepath, () => { })));
    throw createError({
      statusCode: 400,
      message: `${parsed.error.errors[0].path.join('.')} - ${parsed.error.errors[0].message}` || 'Invalid form submission'
    });
  }
  const data = parsed.data;

  const filesArray = Object.keys(files).flatMap(key =>
    files[key]?.map(file => ({
      filepath: file.filepath,
      originalFilename: file.originalFilename,
      mimetype: file.mimetype
    }))
  );

  if (filesArray.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No files uploaded'
    });
  }

  for (const file of filesArray) {
    if (!isValidFile(file)) {
      filesArray.forEach(f => fs.unlink(f.filepath, () => { }));
      throw createError({
        statusCode: 400,
        message: `Invalid file format: ${file.originalFilename}`
      });
    }
  }

  const ipfsCids = await uploadFilesToIPFS(
    filesArray.map(f => ({ filepath: f.filepath, originalFilename: f.originalFilename }))
  );

  filesArray.forEach(file => fs.unlink(file.filepath, () => { }));

  const pageData = ipfsCids.map((cid, index) => ({
    filePath: cid,
    fileOrder: index
  }));

  const result = await prisma.$transaction(async (prisma) => {
    const newChapter = await prisma.chapter.create({
      data: {
        malId: data.malId,
        language: data.language,
        volume: data.volume,
        chapterNumber: data.chapterNumber,
        chapterTitle: data.chapterTitle,
        isOneshot: data.isOneshot,
        uploaderId: data.uploaderId,
      }
    });

    await prisma.page.createMany({
      data: pageData.map((p) => ({
        chapterId: newChapter.chapterId,
        filePath: p.filePath,
        fileOrder: p.fileOrder
      }))
    });

    return newChapter;
  });

  return {
    message: 'Successfully uploaded chapter',
    result: result
  };
});