import { Inject, Injectable } from '@nestjs/common';
import type { IRagPromptPreferenceRepository } from '../../ports/rag-prompt-preference.repository';
import { RAG_PROMPT_PREFERENCE_REPOSITORY } from '../../ports/rag-prompt-preference.repository';

@Injectable()
export class GetPromptPreferenceUseCase {
  constructor(
    @Inject(RAG_PROMPT_PREFERENCE_REPOSITORY)
    private readonly prefRepo: IRagPromptPreferenceRepository,
  ) {}

  async run(fileId: string): Promise<{ customInstructions: string | null }> {
    const row = await this.prefRepo.getByFileId(fileId);
    return { customInstructions: row?.customInstructions ?? null };
  }
}
