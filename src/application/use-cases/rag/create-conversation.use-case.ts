import { Inject, Injectable } from '@nestjs/common';
import type { IRagConversationRepository } from '../../ports/rag-conversation.repository';
import { RAG_CONVERSATION_REPOSITORY } from '../../ports/rag-conversation.repository';

@Injectable()
export class CreateConversationUseCase {
  constructor(
    @Inject(RAG_CONVERSATION_REPOSITORY) private readonly convRepo: IRagConversationRepository,
  ) {}

  async run(fileId: string): Promise<{ conversationId: string }> {
    return this.convRepo.createConversation(fileId);
  }
}
