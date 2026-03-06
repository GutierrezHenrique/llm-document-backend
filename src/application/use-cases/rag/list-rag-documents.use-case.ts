import { Inject, Injectable } from '@nestjs/common';
import type { IRagRepository, RagDocumentListItem } from '../../ports/rag.repository';
import { RAG_REPOSITORY } from '../../ports/rag.repository';

@Injectable()
export class ListRagDocumentsUseCase {
  constructor(@Inject(RAG_REPOSITORY) private readonly ragRepo: IRagRepository) {}

  async run(): Promise<RagDocumentListItem[]> {
    return this.ragRepo.listDocuments();
  }
}
