import { Test, TestingModule } from '@nestjs/testing';
import { CreateConversationUseCase } from './create-conversation.use-case';
import { RAG_CONVERSATION_REPOSITORY } from '../../ports/rag-conversation.repository';

describe('CreateConversationUseCase', () => {
  let useCase: CreateConversationUseCase;
  let convRepoMock: any;

  beforeEach(async () => {
    convRepoMock = {
      createConversation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateConversationUseCase,
        {
          provide: RAG_CONVERSATION_REPOSITORY,
          useValue: convRepoMock,
        },
      ],
    }).compile();

    useCase = module.get<CreateConversationUseCase>(CreateConversationUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a conversation and return the ID', async () => {
    const mockResponse = { conversationId: 'conv123' };
    convRepoMock.createConversation.mockResolvedValue(mockResponse);

    const result = await useCase.run('file123');
    expect(result).toEqual(mockResponse);
    expect(convRepoMock.createConversation).toHaveBeenCalledWith('file123');
  });
});
