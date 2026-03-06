import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  IRagRepository,
  RagChunkRecord,
  RagDocumentListItem,
} from '../../application/ports/rag.repository';

@Injectable()
export class PrismaRagRepository implements IRagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertDocument(
    fileId: string,
    meta?: { category?: string; keywords?: string[] },
  ): Promise<{ documentId: string }> {
    const doc = await this.prisma.ragDocument.upsert({
      where: { fileId },
      create: {
        fileId,
        category: meta?.category ?? null,
        keywords: meta?.keywords ? JSON.stringify(meta.keywords) : null,
      },
      update: {
        ...(meta?.category !== undefined && { category: meta.category }),
        ...(meta?.keywords !== undefined && { keywords: JSON.stringify(meta.keywords) }),
      },
    });
    return { documentId: doc.id };
  }

  async deleteChunksByDocumentId(documentId: string): Promise<void> {
    await this.prisma.ragChunk.deleteMany({ where: { documentId } });
  }

  async createChunks(
    documentId: string,
    chunks: { text: string; keywords: string[]; embedding?: number[] }[],
  ): Promise<number> {
    if (chunks.length === 0) return 0;
    await this.prisma.ragChunk.createMany({
      data: chunks.map((c, i) => ({
        documentId,
        chunkIndex: i,
        text: c.text,
        keywords: JSON.stringify(c.keywords),
        embedding: c.embedding ? JSON.stringify(c.embedding) : null,
      })),
    });
    return chunks.length;
  }

  private toChunkRecord(c: { id: string; text: string; keywords: string | null; embedding: string | null }): RagChunkRecord {
    return {
      id: c.id,
      text: c.text,
      keywords: c.keywords ? (JSON.parse(c.keywords) as string[]) : [],
      embedding: c.embedding ? (JSON.parse(c.embedding) as number[]) : undefined,
    };
  }

  async findChunksByFileId(fileId: string): Promise<RagChunkRecord[]> {
    if (fileId === 'all') {
      const chunks = await this.prisma.ragChunk.findMany({
        take: 50,
        orderBy: { chunkIndex: 'asc' },
      });
      return chunks.map((c) => this.toChunkRecord(c as any));
    }
    const doc = await this.prisma.ragDocument.findUnique({
      where: { fileId },
      include: { chunks: { orderBy: { chunkIndex: 'asc' } } },
    });
    if (!doc?.chunks.length) return [];
    return doc.chunks.map((c) => this.toChunkRecord(c as any));
  }

  async findChunksByFileIdAndKeywords(
    fileId: string,
    queryKeywords: string[],
    limit: number,
  ): Promise<RagChunkRecord[]> {
    if (queryKeywords.length === 0) return this.findChunksByFileId(fileId).then((chunks) => chunks.slice(0, limit));
    
    const keywordsLower = [...new Set(queryKeywords.map((k) => k.toLowerCase().trim()).filter(Boolean))];
    if (keywordsLower.length === 0) return this.findChunksByFileId(fileId).then((chunks) => chunks.slice(0, limit));
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    type Row = { id: string; documentId: string; chunkIndex: number; text: string; keywords: string | null; embedding: string | null };
    const keywordParams = keywordsLower.map((k) => Prisma.sql`${k}`);
    
    if (fileId === 'all') {
      const rows = await this.prisma.$queryRaw<Row[]>(
        Prisma.sql`
          WITH scored AS (
            SELECT rc.id, rc."documentId", rc."chunkIndex", rc.text, rc.keywords, rc.embedding,
              (SELECT COUNT(*) FROM jsonb_array_elements_text(rc.keywords::jsonb) AS t(elem)
               WHERE lower(trim(t.elem)) IN (${Prisma.join(keywordParams, ', ')})) AS match_count
            FROM "RagChunk" rc
            WHERE rc.keywords IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM jsonb_array_elements_text(rc.keywords::jsonb) AS t(elem)
              WHERE lower(trim(t.elem)) IN (${Prisma.join(keywordParams, ', ')})
            )
          )
          SELECT id, "documentId", "chunkIndex", text, keywords, embedding FROM scored
          ORDER BY match_count DESC, "chunkIndex" ASC
          LIMIT ${safeLimit}
        `,
      );
      return rows.map((c) => this.toChunkRecord(c as any));
    }

    const doc = await this.prisma.ragDocument.findUnique({ where: { fileId }, select: { id: true } });
    if (!doc) return [];
    
    const rows = await this.prisma.$queryRaw<Row[]>(
      Prisma.sql`
        WITH scored AS (
          SELECT rc.id, rc."documentId", rc."chunkIndex", rc.text, rc.keywords, rc.embedding,
            (SELECT COUNT(*) FROM jsonb_array_elements_text(rc.keywords::jsonb) AS t(elem)
             WHERE lower(trim(t.elem)) IN (${Prisma.join(keywordParams, ', ')})) AS match_count
          FROM "RagChunk" rc
          WHERE rc."documentId" = ${doc.id}
          AND rc.keywords IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(rc.keywords::jsonb) AS t(elem)
            WHERE lower(trim(t.elem)) IN (${Prisma.join(keywordParams, ', ')})
          )
        )
        SELECT id, "documentId", "chunkIndex", text, keywords, embedding FROM scored
        ORDER BY match_count DESC, "chunkIndex" ASC
        LIMIT ${safeLimit}
      `,
    );
    return rows.map((c) => this.toChunkRecord(c as any));
  }

  async listDocuments(): Promise<RagDocumentListItem[]> {
    const docs = await this.prisma.ragDocument.findMany({
      include: { _count: { select: { chunks: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return docs.map((d) => ({
      fileId: d.fileId,
      chunksCount: d._count.chunks,
      createdAt: d.createdAt.toISOString(),
      category: d.category ?? undefined,
      keywords: d.keywords ? (JSON.parse(d.keywords) as string[]) : undefined,
    }));
  }

  async deleteDocument(fileId: string): Promise<void> {
    await this.prisma.ragDocument.delete({
      where: { fileId },
    });
  }
}
