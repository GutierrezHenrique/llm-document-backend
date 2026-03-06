import { Test, TestingModule } from '@nestjs/testing';
import { ListRagDocumentsUseCase } from './list-rag-documents.use-case';
import { RAG_REPOSITORY } from '../../ports/rag.repository';

describe('ListRagDocumentsUseCase', () => {
  let useCase: ListRagDocumentsUseCase;
  let ragRepoMock: any;

  beforeEach(async () => {
    ragRepoMock = {
      listDocuments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListRagDocumentsUseCase,
        {
          provide: RAG_REPOSITORY,
          useValue: ragRepoMock,
        },
      ],
    }).compile();

    useCase = module.get<ListRagDocumentsUseCase>(ListRagDocumentsUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return documents from the repository', async () => {
    const mockDocs = [
      { fileId: 'doc1', chunksCount: 5, createdAt: new Date().toISOString() },
    ];
    ragRepoMock.listDocuments.mockResolvedValue(mockDocs);

    const result = await useCase.run();
    expect(result).toEqual(mockDocs);
    expect(ragRepoMock.listDocuments).toHaveBeenCalledTimes(1);
  });
});
