import { Inject, Injectable } from '@nestjs/common';
import { LlmService } from '../../../common/llm.service';
import { extractKeywords } from '../../../common/keywords';
import type { IRagRepository } from '../../ports/rag.repository';
import { RAG_REPOSITORY } from '../../ports/rag.repository';
import type { IDocumentStorage } from '../../ports/document-storage.port';
import { DOCUMENT_STORAGE } from '../../ports/document-storage.port';
import pdfParse from 'pdf-parse';

@Injectable()
export class IndexRagDocumentUseCase {
  constructor(
    private readonly llm: LlmService,
    @Inject(RAG_REPOSITORY) private readonly ragRepo: IRagRepository,
    @Inject(DOCUMENT_STORAGE) private readonly documentStorage: IDocumentStorage,
  ) {}

  private chunkTextWithPages(text: string, chunkSize = 800, overlap = 200): string[] {
    const pages = text.split('\n---PAGE_').filter(p => p.trim());
    const chunks: string[] = [];
    
    if (pages.length === 0 || !text.includes('\n---PAGE_')) {
      // Fallback for raw text
      let start = 0;
      while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end).trim());
        start += chunkSize - overlap;
      }
      return chunks.filter((c) => c.length > 0);
    }

    for (const page of pages) {
      const match = page.match(/^(\d+)---/);
      const pageNum = match ? match[1] : '?';
      const bareText = page.replace(/^\d+---\n?/, '').trim();
      if (!bareText) continue;

      let start = 0;
      while (start < bareText.length) {
        const end = Math.min(start + chunkSize, bareText.length);
        chunks.push(`[Page ${pageNum}] ` + bareText.slice(start, end).trim());
        start += chunkSize - overlap;
      }
    }
    return chunks.filter((c) => c.length > 0);
  }

  async runFromPdf(fileId: string, buffer: Buffer): Promise<{ chunks: number; category?: string; keywords?: string[] }> {
    await this.documentStorage.upload(fileId, buffer, 'pdf');

    const renderPage = async (pageData: any) => {
      const textContent = await pageData.getTextContent();
      const text = textContent.items.map((i: any) => i.str).join(' ');
      return `\n---PAGE_${pageData.pageIndex + 1}---\n${text}`;
    };

    const data = await pdfParse(buffer, { pagerender: renderPage });
    return this.index(fileId, data.text);
  }

  async runFromText(fileId: string, text: string): Promise<{ chunks: number; category?: string; keywords?: string[] }> {
    return this.index(fileId, text);
  }

  /**
   * Index with keywords only (no embeddings) to minimize cost.
   * One cheap LLM call for document classification; keyword extraction per chunk is local.
   */
  private async index(
    fileId: string,
    fullText: string,
  ): Promise<{ chunks: number; category?: string; keywords?: string[] }> {
    const chunks = this.chunkTextWithPages(fullText);
    if (chunks.length === 0) return { chunks: 0 };

    const chunkKeywords = chunks.map((text: string) => extractKeywords(text));
    const documentSample = fullText.slice(0, 800);
    let category: string | undefined;
    let docKeywords: string[] = [];
    try {
      const classified = await this.llm.classifyDocument(documentSample);
      category = classified.category;
      docKeywords = classified.keywords ?? [];
    } catch {
      // OpenAI/LLM failure: index without category so upload still succeeds
    }

    const { documentId } = await this.ragRepo.upsertDocument(fileId, {
      category,
      keywords: docKeywords,
    });
    await this.ragRepo.deleteChunksByDocumentId(documentId);
    const count = await this.ragRepo.createChunks(
      documentId,
      chunks.map((text: string, i: number) => ({ text, keywords: chunkKeywords[i], embedding: undefined })),
    );
    return { chunks: count, category, keywords: docKeywords };
  }
}
