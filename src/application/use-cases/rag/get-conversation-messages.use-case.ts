import { Inject, Injectable } from '@nestjs/common';
import type { IRagConversationRepository, RagMessageRecord } from '../../ports/rag-conversation.repository';
import { RAG_CONVERSATION_REPOSITORY } from '../../ports/rag-conversation.repository';

@Injectable()
export class GetConversationMessagesUseCase {
  constructor(
    @Inject(RAG_CONVERSATION_REPOSITORY) private readonly convRepo: IRagConversationRepository,
  ) {}

  async run(conversationId: string): Promise<RagMessageRecord[]> {
    return this.convRepo.getMessages(conversationId);
  }
}
