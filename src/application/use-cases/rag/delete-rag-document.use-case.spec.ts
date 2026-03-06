import { Test, TestingModule } from '@nestjs/testing';
import { DeleteRagDocumentUseCase } from './delete-rag-document.use-case';
import { RAG_REPOSITORY } from '../../ports/rag.repository';
import { DOCUMENT_STORAGE } from '../../ports/document-storage.port';

describe('DeleteRagDocumentUseCase', () => {
  let useCase: DeleteRagDocumentUseCase;
  let ragRepoMock: any;
  let documentStorageMock: any;

  beforeEach(async () => {
    ragRepoMock = {
      deleteDocument: jest.fn(),
    };
    documentStorageMock = {
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRagDocumentUseCase,
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

    useCase = module.get<DeleteRagDocumentUseCase>(DeleteRagDocumentUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete a document and remove file from storage', async () => {
    ragRepoMock.deleteDocument.mockResolvedValue(undefined);

    await useCase.run('doc123');
    expect(ragRepoMock.deleteDocument).toHaveBeenCalledWith('doc123');
    expect(documentStorageMock.delete).toHaveBeenCalledWith('doc123', 'pdf');
  });
});
