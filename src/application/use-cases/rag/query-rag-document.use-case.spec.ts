import { Test, TestingModule } from '@nestjs/testing';
import { QueryRagDocumentUseCase } from './query-rag-document.use-case';
import { LlmService } from '../../../common/llm.service';
import { RAG_REPOSITORY } from '../../ports/rag.repository';
import { RAG_CONVERSATION_REPOSITORY } from '../../ports/rag-conversation.repository';

describe('QueryRagDocumentUseCase', () => {
  let useCase: QueryRagDocumentUseCase;
  let llmMock: any;
  let ragRepoMock: any;
  let convRepoMock: any;

  beforeEach(async () => {
    llmMock = { chat: jest.fn() };
    ragRepoMock = {
      findChunksByFileIdAndKeywords: jest.fn(),
      findChunksByFileId: jest.fn(),
    };
    convRepoMock = {
      getMessages: jest.fn(),
      createConversation: jest.fn(),
      addMessage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryRagDocumentUseCase,
        { provide: LlmService, useValue: llmMock },
        { provide: RAG_REPOSITORY, useValue: ragRepoMock },
        { provide: RAG_CONVERSATION_REPOSITORY, useValue: convRepoMock },
      ],
    }).compile();

    useCase = module.get<QueryRagDocumentUseCase>(QueryRagDocumentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw error if no chunks found', async () => {
    ragRepoMock.findChunksByFileIdAndKeywords.mockResolvedValue([]);
    ragRepoMock.findChunksByFileId.mockResolvedValue([]);

    await expect(useCase.run('file1', 'hello')).rejects.toThrow('Este documento ainda não foi adicionado');
  });

  it('should create conversation if no conversationId provided', async () => {
    ragRepoMock.findChunksByFileIdAndKeywords.mockResolvedValue([{ text: 'chunk1' }]);
    convRepoMock.createConversation.mockResolvedValue({ conversationId: 'new-conv' });
    convRepoMock.getMessages.mockResolvedValue([]);
    llmMock.chat.mockResolvedValue('answer');

    const result = await useCase.run('file1', 'hello');
    expect(result.conversationId).toBe('new-conv');
    expect(convRepoMock.createConversation).toHaveBeenCalledWith('file1');
  });

  it('should query LLM and save messages', async () => {
    const chunks = [{ text: 'source content' }];
    ragRepoMock.findChunksByFileIdAndKeywords.mockResolvedValue(chunks);
    convRepoMock.getMessages.mockResolvedValue([{ role: 'user', content: 'prev' }]);
    llmMock.chat.mockResolvedValue('The answer is simple.');

    const result = await useCase.run('file1', 'What is simple?', 5, 'conv123');

    expect(result.answer).toBe('The answer is simple.');
    expect(result.snippets).toEqual(['source content']);
    expect(llmMock.chat).toHaveBeenCalled();
    expect(convRepoMock.addMessage).toHaveBeenCalledWith('conv123', 'user', 'What is simple?');
    expect(convRepoMock.addMessage).toHaveBeenCalledWith('conv123', 'assistant', 'The answer is simple.', ['source content']);
  });

  it('should handle LLM failure and return fallback', async () => {
    ragRepoMock.findChunksByFileIdAndKeywords.mockResolvedValue([{ text: 'chunk' }]);
    convRepoMock.getMessages.mockResolvedValue([]);
    llmMock.chat.mockRejectedValue(new Error('GPT Down'));

    const result = await useCase.run('file1', 'hello', 5, 'conv123');
    expect(result.answer).toContain('serviço de IA está temporariamente indisponível');
    expect(convRepoMock.addMessage).toHaveBeenCalled();
  });
});
