import { Inject, Injectable } from '@nestjs/common';
import type { IRagRepository, RagChunkRecord } from '../../ports/rag.repository';
import { RAG_REPOSITORY } from '../../ports/rag.repository';

@Injectable()
export class GetDocumentChunksUseCase {
  constructor(@Inject(RAG_REPOSITORY) private readonly ragRepo: IRagRepository) {}

  async run(fileId: string): Promise<RagChunkRecord[]> {
    return this.ragRepo.findChunksByFileId(fileId);
  }
}
