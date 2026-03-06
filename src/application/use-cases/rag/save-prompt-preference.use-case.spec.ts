import { Test, TestingModule } from '@nestjs/testing';
import { SavePromptPreferenceUseCase } from './save-prompt-preference.use-case';
import { RAG_PROMPT_PREFERENCE_REPOSITORY } from '../../ports/rag-prompt-preference.repository';

describe('SavePromptPreferenceUseCase', () => {
  let useCase: SavePromptPreferenceUseCase;
  let prefRepoMock: any;

  beforeEach(async () => {
    prefRepoMock = {
      upsert: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavePromptPreferenceUseCase,
        {
          provide: RAG_PROMPT_PREFERENCE_REPOSITORY,
          useValue: prefRepoMock,
        },
      ],
    }).compile();

    useCase = module.get<SavePromptPreferenceUseCase>(SavePromptPreferenceUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should trim and save preference', async () => {
    await useCase.run('file123', '  be concise  ');
    expect(prefRepoMock.upsert).toHaveBeenCalledWith('file123', 'be concise');
  });

  it('should save null if empty or null', async () => {
    await useCase.run('file123', '   ');
    expect(prefRepoMock.upsert).toHaveBeenCalledWith('file123', null);

    await useCase.run('file123', null);
    expect(prefRepoMock.upsert).toHaveBeenCalledWith('file123', null);
  });
});
