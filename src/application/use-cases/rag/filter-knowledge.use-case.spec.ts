import { Test, TestingModule } from '@nestjs/testing';
import { FilterKnowledgeUseCase } from './filter-knowledge.use-case';
import { LlmService } from '../../../common/llm.service';
import { RAG_REPOSITORY } from '../../ports/rag.repository';

describe('FilterKnowledgeUseCase', () => {
  let useCase: FilterKnowledgeUseCase;
  let llmMock: any;
  let ragRepoMock: any;

  beforeEach(async () => {
    llmMock = {
      parseFilterDescription: jest.fn(),
    };
    ragRepoMock = {
      listDocuments: jest.fn(),
      findChunksByFileId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilterKnowledgeUseCase,
        {
          provide: LlmService,
          useValue: llmMock,
        },
        {
          provide: RAG_REPOSITORY,
          useValue: ragRepoMock,
        },
      ],
    }).compile();

    useCase = module.get<FilterKnowledgeUseCase>(FilterKnowledgeUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return empty docs if repo is empty', async () => {
    ragRepoMock.listDocuments.mockResolvedValue([]);
    const result = await useCase.run('show me everything');
    expect(result.documents).toHaveLength(0);
  });

  it('should filter documents by category and keywords and fetch chunks', async () => {
    const mockDocs = [
      { fileId: 'doc1', chunksCount: 1, category: 'Technical', keywords: ['AI', 'ML'], createdAt: new Date().toISOString() },
      { fileId: 'doc2', chunksCount: 1, category: 'Legal', keywords: ['Contract'], createdAt: new Date().toISOString() },
    ];
    ragRepoMock.listDocuments.mockResolvedValue(mockDocs);
    llmMock.parseFilterDescription.mockResolvedValue({ category: 'Technical', keywords: ['AI'] });
    ragRepoMock.findChunksByFileId.mockResolvedValue([{ id: 'c1', text: 'AI content', keywords: ['AI'] }]);

    const result = await useCase.run('tech docs about AI');
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0].fileId).toBe('doc1');
    expect(result.documents[0].chunks[0].text).toBe('AI content');
  });

  it('should return all docs if no category or keywords parsed', async () => {
      const mockDocs = [
          { fileId: 'doc1', chunksCount: 1, createdAt: new Date().toISOString() },
      ];
      ragRepoMock.listDocuments.mockResolvedValue(mockDocs);
      llmMock.parseFilterDescription.mockResolvedValue({ category: null, keywords: [] });
      ragRepoMock.findChunksByFileId.mockResolvedValue([{ id: 'c1', text: 'text', keywords: [] }]);

      const result = await useCase.run('show me everything');
      expect(result.documents).toHaveLength(1);
  });
});
