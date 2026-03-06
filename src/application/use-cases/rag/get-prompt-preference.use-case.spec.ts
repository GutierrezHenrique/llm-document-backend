import { Test, TestingModule } from '@nestjs/testing';
import { GetPromptPreferenceUseCase } from './get-prompt-preference.use-case';
import { RAG_PROMPT_PREFERENCE_REPOSITORY } from '../../ports/rag-prompt-preference.repository';

describe('GetPromptPreferenceUseCase', () => {
  let useCase: GetPromptPreferenceUseCase;
  let prefRepoMock: any;

  beforeEach(async () => {
    prefRepoMock = {
      getByFileId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPromptPreferenceUseCase,
        {
          provide: RAG_PROMPT_PREFERENCE_REPOSITORY,
          useValue: prefRepoMock,
        },
      ],
    }).compile();

    useCase = module.get<GetPromptPreferenceUseCase>(GetPromptPreferenceUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return prompt preference if it exists', async () => {
    prefRepoMock.getByFileId.mockResolvedValue({ customInstructions: 'be kind' });

    const result = await useCase.run('file123');
    expect(result).toEqual({ customInstructions: 'be kind' });
    expect(prefRepoMock.getByFileId).toHaveBeenCalledWith('file123');
  });

  it('should return null if preference does not exist', async () => {
    prefRepoMock.getByFileId.mockResolvedValue(null);

    const result = await useCase.run('file123');
    expect(result).toEqual({ customInstructions: null });
  });
});
