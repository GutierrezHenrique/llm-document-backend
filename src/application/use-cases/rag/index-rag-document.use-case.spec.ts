import { Test, TestingModule } from '@nestjs/testing';
import { IndexRagDocumentUseCase } from './index-rag-document.use-case';
import { LlmService } from '../../../common/llm.service';
import { RAG_REPOSITORY } from '../../ports/rag.repository';
import { DOCUMENT_STORAGE } from '../../ports/document-storage.port';

jest.mock('pdf-parse', () => jest.fn().mockImplementation(async (buffer, options) => {
  if (options && options.pagerender) {
    await options.pagerender({
      getTextContent: () => Promise.resolve({ items: [{ str: 'page text' }] }),
      pageIndex: 0,
    });
  }
  return { text: 'pdf content' };
}));

describe('IndexRagDocumentUseCase', () => {
  let useCase: IndexRagDocumentUseCase;
  let llmMock: any;
  let ragRepoMock: any;
  let documentStorageMock: any;

  beforeEach(async () => {
    llmMock = {
      classifyDocument: jest.fn(),
    };
    ragRepoMock = {
      upsertDocument: jest.fn(),
      deleteChunksByDocumentId: jest.fn(),
      createChunks: jest.fn(),
    };
    documentStorageMock = {
      upload: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndexRagDocumentUseCase,
        {
          provide: LlmService,
          useValue: llmMock,
        },
        {
          provide: RAG_REPOSITORY,
          useValue: ragRepoMock,
        },
        {
          provide: DOCUMENT_STORAGE,
          useValue: documentStorageMock,
        },
      ],
    }).compile();

    useCase = module.get<IndexRagDocumentUseCase>(IndexRagDocumentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should index from text correctly', async () => {
    ragRepoMock.upsertDocument.mockResolvedValue({ documentId: 'doc123' });
    llmMock.classifyDocument.mockResolvedValue({ category: 'Test', keywords: ['k1'] });
    ragRepoMock.createChunks.mockResolvedValue(1);

    const result = await useCase.runFromText('file1', 'some long text to index');
    expect(result.chunks).toBe(1);
    expect(ragRepoMock.upsertDocument).toHaveBeenCalled();
    expect(ragRepoMock.createChunks).toHaveBeenCalled();
  });

  it('should handle LLM failure gracefully', async () => {
    ragRepoMock.upsertDocument.mockResolvedValue({ documentId: 'doc123' });
    llmMock.classifyDocument.mockRejectedValue(new Error('LLM down'));
    ragRepoMock.createChunks.mockResolvedValue(1);

    const result = await useCase.runFromText('file1', 'text');
    expect(result.chunks).toBe(1);
    expect(result.category).toBeUndefined();
  });

  it('should chunk text correctly with pages', async () => {
    ragRepoMock.upsertDocument.mockResolvedValue({ documentId: 'doc1' });
    ragRepoMock.createChunks.mockResolvedValue(2);
    
    const textWithPages = '\n---PAGE_1---\nPage One Content\n---PAGE_2---\nPage Two Content';
    const result = await useCase.runFromText('file1', textWithPages);
    expect(result.chunks).toBe(2);
  });

  it('should index from PDF correctly', async () => {
    ragRepoMock.upsertDocument.mockResolvedValue({ documentId: 'doc1' });
    ragRepoMock.createChunks.mockResolvedValue(1);

    const result = await useCase.runFromPdf('file1', Buffer.from('fake pdf'));
    expect(result.chunks).toBe(1);
    expect(documentStorageMock.upload).toHaveBeenCalledWith('file1', Buffer.from('fake pdf'), 'pdf');
  });
});
