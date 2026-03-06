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

    let docs: RagDocumentListItem[] = allDocs;
    if (category || (keywords && keywords.length > 0)) {
      const catLower = category?.toLowerCase().trim();
      const kwSet = keywords?.length
        ? new Set(keywords.map((k) => k.toLowerCase().trim()).filter(Boolean))
        : null;
      docs = allDocs.filter((d) => {
        const catMatch = !catLower || (d.category?.toLowerCase().includes(catLower) ?? false);
        const docKw = d.keywords ?? [];
        const kwMatch =
          !kwSet ||
          kwSet.size === 0 ||
          docKw.some((k) => kwSet.has(k.toLowerCase().trim()));
        return catMatch && kwMatch;
      });
    }

    const result: FilteredDocumentItem[] = [];
    for (const d of docs) {
      const chunks: RagChunkRecord[] = await this.ragRepo.findChunksByFileId(d.fileId);
      let filteredChunks = chunks;
      if (keywords?.length) {
        const kwSet = new Set(keywords.map((k) => k.toLowerCase().trim()).filter(Boolean));
        filteredChunks = chunks.filter((c) =>
          c.keywords.some((k) => kwSet.has(k.toLowerCase().trim())),
        );
        if (filteredChunks.length === 0) filteredChunks = chunks.slice(0, 20);
      } else {
        filteredChunks = chunks.slice(0, 50);
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
