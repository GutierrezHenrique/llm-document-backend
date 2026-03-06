import { Injectable, Inject } from '@nestjs/common';
import { IRagRepository, RAG_REPOSITORY } from '../../ports/rag.repository';
import type { IDocumentStorage } from '../../ports/document-storage.port';
import { DOCUMENT_STORAGE } from '../../ports/document-storage.port';

@Injectable()
export class DeleteRagDocumentUseCase {
  constructor(
    @Inject(RAG_REPOSITORY)
    private readonly ragRepo: IRagRepository,
    @Inject(DOCUMENT_STORAGE)
    private readonly documentStorage: IDocumentStorage,
  ) {}

  async run(fileId: string): Promise<void> {
    await this.ragRepo.deleteDocument(fileId);
    await this.documentStorage.delete(fileId, 'pdf');
  }
}
