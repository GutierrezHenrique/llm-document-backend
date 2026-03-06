import { Inject, Injectable } from '@nestjs/common';
import { LlmService } from '../../../common/llm.service';
import type { IRagRepository, RagDocumentListItem, RagChunkRecord } from '../../ports/rag.repository';
import { RAG_REPOSITORY } from '../../ports/rag.repository';

export interface FilteredChunkItem {
  id: string;
  text: string;
  keywords: string[];
}

export interface FilteredDocumentItem {
  fileId: string;
  chunksCount: number;
  category?: string | null;
  keywords?: string[] | null;
  createdAt: string;
  chunks: FilteredChunkItem[];
}

@Injectable()
export class FilterKnowledgeUseCase {
  constructor(
    private readonly llm: LlmService,
    @Inject(RAG_REPOSITORY) private readonly ragRepo: IRagRepository,
  ) {}

  async run(filterDescription: string): Promise<{ documents: FilteredDocumentItem[] }> {
    const allDocs = await this.ragRepo.listDocuments();
    if (allDocs.length === 0) return { documents: [] };

    const { category, keywords } = await this.llm.parseFilterDescription(filterDescription);
    const searchKeywords = keywords?.map((k) => k.toLowerCase().trim()).filter(Boolean) ?? [];
    const catLower = category?.toLowerCase().trim();

    // Category filter: bidirectional (e.g. "report" matches "Technical Reports", "technical" matches "Technical")
    let docs: RagDocumentListItem[] = allDocs;
    if (catLower) {
      docs = allDocs.filter((d) => {
        const docCat = d.category?.toLowerCase().trim() ?? '';
        return docCat.includes(catLower) || catLower.includes(docCat);
      });
    }

    const result: FilteredDocumentItem[] = [];
    const maxChunksPerDoc = 50;

    for (const d of docs) {
      const chunks: RagChunkRecord[] = await this.ragRepo.findChunksByFileId(d.fileId);

      let filteredChunks: RagChunkRecord[];
      if (searchKeywords.length > 0) {
        // Match chunk if any search keyword appears in chunk text OR overlaps with chunk keywords (substring)
        filteredChunks = chunks.filter((c) => {
          const textLower = c.text.toLowerCase();
          const chunkKwLower = c.keywords.map((k) => k.toLowerCase().trim());
          return searchKeywords.some(
            (sk) =>
              textLower.includes(sk) ||
              chunkKwLower.some((ck) => ck.includes(sk) || sk.includes(ck)),
          );
        });
        // If no chunks match by keyword/text, exclude doc when we had keywords (semantic filter)
        if (filteredChunks.length === 0) continue;
        if (filteredChunks.length > maxChunksPerDoc) {
          filteredChunks = filteredChunks.slice(0, maxChunksPerDoc);
        }
      } else {
        filteredChunks = chunks.slice(0, maxChunksPerDoc);
      }

      result.push({
        fileId: d.fileId,
        chunksCount: d.chunksCount,
        category: d.category ?? undefined,
        keywords: d.keywords ?? undefined,
        createdAt: d.createdAt,
        chunks: filteredChunks.map(
          (c): FilteredChunkItem => ({ id: c.id, text: c.text, keywords: c.keywords }),
        ),
      });
    }

    return { documents: result };
  }
}
