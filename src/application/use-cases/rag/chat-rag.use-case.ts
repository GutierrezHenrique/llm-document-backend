import { Injectable } from '@nestjs/common';
import { LlmService } from '../../../common/llm.service';
import { PROMPTS } from '../../../common/prompts/templates';

@Injectable()
export class ChatRagUseCase {
  constructor(private readonly llmService: LlmService) {}

  async run(question: string): Promise<{ answer: string }> {
    const content = PROMPTS.SIMPLE_CHAT(question);
    const answer = await this.llmService.chat([{ role: 'user', content }]);
    return { answer };
  }
}
