import { Inject, Injectable } from '@nestjs/common';
import type { IRagConversationRepository } from '../../ports/rag-conversation.repository';
import { RAG_CONVERSATION_REPOSITORY } from '../../ports/rag-conversation.repository';

@Injectable()
export class DeleteConversationUseCase {
  constructor(
    @Inject(RAG_CONVERSATION_REPOSITORY) private readonly convRepo: IRagConversationRepository,
  ) {}

  async run(conversationId: string): Promise<void> {
    await this.convRepo.deleteConversation(conversationId);
  }
}
