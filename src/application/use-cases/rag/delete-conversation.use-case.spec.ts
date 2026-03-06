import { Test, TestingModule } from '@nestjs/testing';
import { DeleteConversationUseCase } from './delete-conversation.use-case';
import { RAG_CONVERSATION_REPOSITORY } from '../../ports/rag-conversation.repository';

describe('DeleteConversationUseCase', () => {
  let useCase: DeleteConversationUseCase;
  let convRepoMock: any;

  beforeEach(async () => {
    convRepoMock = {
      deleteConversation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteConversationUseCase,
        {
          provide: RAG_CONVERSATION_REPOSITORY,
          useValue: convRepoMock,
        },
      ],
    }).compile();

    useCase = module.get<DeleteConversationUseCase>(DeleteConversationUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete a conversation', async () => {
    convRepoMock.deleteConversation.mockResolvedValue(undefined);

    await useCase.run('conv123');
    expect(convRepoMock.deleteConversation).toHaveBeenCalledWith('conv123');
  });
});
