import { Test, TestingModule } from '@nestjs/testing';
import { ChatRagUseCase } from './chat-rag.use-case';
import { LlmService } from '../../../common/llm.service';

describe('ChatRagUseCase', () => {
  let useCase: ChatRagUseCase;
  let llmMock: any;

  beforeEach(async () => {
    llmMock = {
      chat: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatRagUseCase,
        {
          provide: LlmService,
          useValue: llmMock,
        },
      ],
    }).compile();

    useCase = module.get<ChatRagUseCase>(ChatRagUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call llm with prompt and return answer', async () => {
    llmMock.chat.mockResolvedValue('I am here to help.');

    const result = await useCase.run('how are you?');
    expect(result).toEqual({ answer: 'I am here to help.' });
    expect(llmMock.chat).toHaveBeenCalledWith([
      { role: 'user', content: expect.stringContaining('how are you?') },
    ]);
  });
});
