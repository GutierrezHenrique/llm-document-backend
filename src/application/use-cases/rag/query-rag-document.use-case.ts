import { Inject, Injectable, Logger } from '@nestjs/common';
import { LlmService } from '../../../common/llm.service';
import { extractKeywordsFromQuestion } from '../../../common/keywords';
import type { IRagRepository } from '../../ports/rag.repository';
import type { IRagConversationRepository } from '../../ports/rag-conversation.repository';
import { RAG_REPOSITORY } from '../../ports/rag.repository';
import { RAG_CONVERSATION_REPOSITORY } from '../../ports/rag-conversation.repository';
import { PROMPTS } from '../../../common/prompts/templates';
import type { OpenAI } from 'openai';

const HISTORY_MESSAGES_LIMIT = 20; // last 10 exchanges for context

@Injectable()
export class QueryRagDocumentUseCase {
  private readonly logger = new Logger(QueryRagDocumentUseCase.name);

  constructor(
    private readonly llm: LlmService,
    @Inject(RAG_REPOSITORY) private readonly ragRepo: IRagRepository,
    @Inject(RAG_CONVERSATION_REPOSITORY) private readonly convRepo: IRagConversationRepository,
  ) {}

  async run(
    fileId: string,
    question: string,
    topK = 5,
    conversationId?: string,
    systemPromptAddition?: string,
  ): Promise<{ answer: string; snippets: string[]; conversationId: string }> {
    const queryKeywords = extractKeywordsFromQuestion(question, 14);
    let chunks = await this.ragRepo.findChunksByFileIdAndKeywords(fileId, queryKeywords, Math.max(topK, 15));
    if (chunks.length === 0) {
      const all = await this.ragRepo.findChunksByFileId(fileId);
      chunks = all.slice(0, Math.max(topK, 10));
    }
    if (!chunks.length) {
      if (fileId === 'all') {
        throw new Error('A base de conhecimento está vazia. Adicione documentos primeiro.');
      }
      throw new Error('Este documento ainda não foi adicionado. Envie o arquivo ou cole o texto na área “Adicionar documento” primeiro.');
    }

    if (!conversationId) {
      const created = await this.convRepo.createConversation(fileId);
      conversationId = created.conversationId;
    }

    const snippets = chunks.map((c) => c.text);
    const history = await this.convRepo.getMessages(conversationId, HISTORY_MESSAGES_LIMIT);

    const system = PROMPTS.RAG_SYSTEM(systemPromptAddition);
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [{ role: 'system', content: system }];

    for (const m of history) {
      messages.push({ role: m.role as 'user' | 'assistant', content: m.content });
    }

    const currentUserContent = PROMPTS.RAG_USER_CONTENT(snippets, question);
    messages.push({ role: 'user', content: currentUserContent });

    let answer: string;
    try {
      answer = await this.llm.chat(messages);
    } catch (err) {
      this.logger.warn(`LLM unavailable: ${err instanceof Error ? err.message : String(err)}. Returning fallback.`);
      const fallback = 'O serviço de IA está temporariamente indisponível. Tente novamente em alguns instantes.';
      await this.convRepo.addMessage(conversationId, 'user', question);
      await this.convRepo.addMessage(conversationId, 'assistant', fallback, []);
      return { answer: fallback, snippets: [], conversationId };
    }

    await this.convRepo.addMessage(conversationId, 'user', question);
    await this.convRepo.addMessage(conversationId, 'assistant', answer, snippets);

    return { answer, snippets, conversationId };
  }
}
