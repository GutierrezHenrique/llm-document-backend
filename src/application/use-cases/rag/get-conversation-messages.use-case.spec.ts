import { Test, TestingModule } from '@nestjs/testing';
import { GetConversationMessagesUseCase } from './get-conversation-messages.use-case';
import { RAG_CONVERSATION_REPOSITORY } from '../../ports/rag-conversation.repository';

describe('GetConversationMessagesUseCase', () => {
  let useCase: GetConversationMessagesUseCase;
  let convRepoMock: any;

  beforeEach(async () => {
    convRepoMock = {
      getMessages: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetConversationMessagesUseCase,
        {
          provide: RAG_CONVERSATION_REPOSITORY,
          useValue: convRepoMock,
        },
      ],
    }).compile();

    useCase = module.get<GetConversationMessagesUseCase>(GetConversationMessagesUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return messages for a conversation', async () => {
    const mockMessages = [
      { id: 'm1', role: 'user', content: 'hello', createdAt: new Date().toISOString() },
    ];
    convRepoMock.getMessages.mockResolvedValue(mockMessages);

    const result = await useCase.run('conv123');
    expect(result).toEqual(mockMessages);
    expect(convRepoMock.getMessages).toHaveBeenCalledWith('conv123');
  });
});
