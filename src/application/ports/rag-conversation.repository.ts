export interface RagMessageRecord {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  snippets?: string[] | null;
  createdAt: string;
}

export const RAG_CONVERSATION_REPOSITORY = Symbol('RAG_CONVERSATION_REPOSITORY');

export interface IRagConversationRepository {
  createConversation(fileId: string): Promise<{ conversationId: string }>;
  getMessages(conversationId: string, limit?: number): Promise<RagMessageRecord[]>;
  addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    snippets?: string[],
  ): Promise<void>;
  deleteConversation(conversationId: string): Promise<void>;
}
