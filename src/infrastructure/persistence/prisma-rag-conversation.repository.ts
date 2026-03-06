import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  IRagConversationRepository,
  RagMessageRecord,
} from '../../application/ports/rag-conversation.repository';

@Injectable()
export class PrismaRagConversationRepository implements IRagConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createConversation(fileId: string): Promise<{ conversationId: string }> {
    const conv = await this.prisma.ragConversation.create({ data: { fileId } });
    return { conversationId: conv.id };
  }

  async getMessages(conversationId: string, limit = 50): Promise<RagMessageRecord[]> {
    const rows = await this.prisma.ragMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    return rows.map((r) => ({
      id: r.id,
      role: r.role as 'user' | 'assistant',
      content: r.content,
      snippets: r.snippets ? (JSON.parse(r.snippets) as string[]) : null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    snippets?: string[],
  ): Promise<void> {
    await this.prisma.ragMessage.create({
      data: {
        conversationId,
        role,
        content,
        snippets: snippets ? JSON.stringify(snippets) : null,
      },
    });
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.prisma.ragConversation.delete({ where: { id: conversationId } });
  }
}
