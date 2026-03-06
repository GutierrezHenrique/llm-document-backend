import { Test, TestingModule } from '@nestjs/testing';
import { RagController } from './rag.controller';
import { IndexRagDocumentUseCase } from '../../application/use-cases/rag/index-rag-document.use-case';
import { ListRagDocumentsUseCase } from '../../application/use-cases/rag/list-rag-documents.use-case';
import { QueryRagDocumentUseCase } from '../../application/use-cases/rag/query-rag-document.use-case';
import { CreateConversationUseCase } from '../../application/use-cases/rag/create-conversation.use-case';
import { GetConversationMessagesUseCase } from '../../application/use-cases/rag/get-conversation-messages.use-case';
import { DeleteConversationUseCase } from '../../application/use-cases/rag/delete-conversation.use-case';
import { DeleteRagDocumentUseCase } from '../../application/use-cases/rag/delete-rag-document.use-case';
import { GetDocumentChunksUseCase } from '../../application/use-cases/rag/get-document-chunks.use-case';
import { FilterKnowledgeUseCase } from '../../application/use-cases/rag/filter-knowledge.use-case';
import { GetPromptPreferenceUseCase } from '../../application/use-cases/rag/get-prompt-preference.use-case';
import { SavePromptPreferenceUseCase } from '../../application/use-cases/rag/save-prompt-preference.use-case';

describe('RagController', () => {
  let module: TestingModule;
  let controller: RagController;
  let listRagMock: any;
  let indexRagMock: any;
  let queryRagMock: any;

  beforeEach(async () => {
    listRagMock = { run: jest.fn() };
    indexRagMock = { runFromPdf: jest.fn(), runFromText: jest.fn() };
    queryRagMock = { run: jest.fn() };

    module = await Test.createTestingModule({
      controllers: [RagController],
      providers: [
        { provide: ListRagDocumentsUseCase, useValue: listRagMock },
        { provide: IndexRagDocumentUseCase, useValue: indexRagMock },
        { provide: QueryRagDocumentUseCase, useValue: queryRagMock },
        { provide: CreateConversationUseCase, useValue: { run: jest.fn() } },
        { provide: GetConversationMessagesUseCase, useValue: { run: jest.fn() } },
        { provide: DeleteConversationUseCase, useValue: { run: jest.fn() } },
        { provide: DeleteRagDocumentUseCase, useValue: { run: jest.fn() } },
        { provide: GetDocumentChunksUseCase, useValue: { run: jest.fn() } },
        { provide: FilterKnowledgeUseCase, useValue: { run: jest.fn() } },
        { provide: GetPromptPreferenceUseCase, useValue: { run: jest.fn() } },
        { provide: SavePromptPreferenceUseCase, useValue: { run: jest.fn() } },
      ],
    }).compile();

    controller = module.get<RagController>(RagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call listDocuments use case', async () => {
    listRagMock.run.mockResolvedValue([]);
    await controller.listDocuments();
    expect(listRagMock.run).toHaveBeenCalled();
  });

  it('should call query use case', async () => {
      queryRagMock.run.mockResolvedValue({ answer: 'hi' });
      await controller.query({ fileId: 'f1', question: 'q1' });
      expect(queryRagMock.run).toHaveBeenCalled();
  });

  it('should call createConversation', async () => {
      await controller.createConversation('f1');
      expect(module.get(CreateConversationUseCase).run).toHaveBeenCalledWith('f1');
  });

  it('should call getConversationMessages', async () => {
      await controller.getConversationMessages('c1');
      expect(module.get(GetConversationMessagesUseCase).run).toHaveBeenCalledWith('c1');
  });

  it('should call deleteConversation', async () => {
      await controller.deleteConversation('c1');
      expect(module.get(DeleteConversationUseCase).run).toHaveBeenCalledWith('c1');
  });

  it('should call deleteRagDocument when deleting document', async () => {
      await controller.deleteDocument('doc-123');
      expect(module.get(DeleteRagDocumentUseCase).run).toHaveBeenCalledWith('doc-123');
  });

  it('should call getDocumentChunks', async () => {
      await controller.getDocumentChunks('f1');
      expect(module.get(GetDocumentChunksUseCase).run).toHaveBeenCalledWith('f1');
  });

  it('should call filterKnowledge', async () => {
      await controller.filterKnowledge({ filterDescription: 'desc' });
      expect(module.get(FilterKnowledgeUseCase).run).toHaveBeenCalledWith('desc');
  });

  it('should call getPromptPreference', async () => {
      await controller.getPromptPreference('f1');
      expect(module.get(GetPromptPreferenceUseCase).run).toHaveBeenCalledWith('f1');
  });

  it('should call savePromptPreference', async () => {
      await controller.savePromptPreference('f1', { customInstructions: 'instr' });
      expect(module.get(SavePromptPreferenceUseCase).run).toHaveBeenCalledWith('f1', 'instr');
  });

  it('should call indexText', async () => {
      await controller.indexText({ fileId: 'f1', text: 'txt' });
      expect(indexRagMock.runFromText).toHaveBeenCalledWith('f1', 'txt');
  });
});
