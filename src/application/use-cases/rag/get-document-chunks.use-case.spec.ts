import { Test, TestingModule } from '@nestjs/testing';
import { GetDocumentChunksUseCase } from './get-document-chunks.use-case';
import { RAG_REPOSITORY } from '../../ports/rag.repository';

describe('GetDocumentChunksUseCase', () => {
  let useCase: GetDocumentChunksUseCase;
  let ragRepoMock: any;

  beforeEach(async () => {
    ragRepoMock = {
      findChunksByFileId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDocumentChunksUseCase,
        {
          provide: RAG_REPOSITORY,
          useValue: ragRepoMock,
        },
      ],
    }).compile();

    useCase = module.get<GetDocumentChunksUseCase>(GetDocumentChunksUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return chunks for a document', async () => {
    const mockChunks = [{ id: 'c1', text: 'chunk text', keywords: [] }];
    ragRepoMock.findChunksByFileId.mockResolvedValue(mockChunks);

    const result = await useCase.run('file123');
    expect(result).toEqual(mockChunks);
    expect(ragRepoMock.findChunksByFileId).toHaveBeenCalledWith('file123');
  });
});
