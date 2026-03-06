import { Inject, Injectable } from '@nestjs/common';
import type { IRagPromptPreferenceRepository } from '../../ports/rag-prompt-preference.repository';
import { RAG_PROMPT_PREFERENCE_REPOSITORY } from '../../ports/rag-prompt-preference.repository';

@Injectable()
export class SavePromptPreferenceUseCase {
  constructor(
    @Inject(RAG_PROMPT_PREFERENCE_REPOSITORY)
    private readonly prefRepo: IRagPromptPreferenceRepository,
  ) {}

  async run(fileId: string, customInstructions: string | null): Promise<void> {
    await this.prefRepo.upsert(fileId, customInstructions ? customInstructions.trim() || null : null);
  }
}
