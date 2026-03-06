import { Body, Controller, Get, Post, Put, Delete, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IndexRagDocumentUseCase } from '../../application/use-cases/rag/index-rag-document.use-case';
import { ListRagDocumentsUseCase } from '../../application/use-cases/rag/list-rag-documents.use-case';
import { QueryRagDocumentUseCase } from '../../application/use-cases/rag/query-rag-document.use-case';
import { CreateConversationUseCase } from '../../application/use-cases/rag/create-conversation.use-case';
import { GetConversationMessagesUseCase } from '../../application/use-cases/rag/get-conversation-messages.use-case';
import { DeleteConversationUseCase } from '../../application/use-cases/rag/delete-conversation.use-case';
import { GetDocumentChunksUseCase } from '../../application/use-cases/rag/get-document-chunks.use-case';
import { FilterKnowledgeUseCase } from '../../application/use-cases/rag/filter-knowledge.use-case';
import { GetPromptPreferenceUseCase } from '../../application/use-cases/rag/get-prompt-preference.use-case';
import { SavePromptPreferenceUseCase } from '../../application/use-cases/rag/save-prompt-preference.use-case';
import { IndexTextBodyDto, QueryBodyDto, FilterBodyDto } from './dto/rag.dto';

@Controller('rag')
export class RagController {
  constructor(
    private readonly indexRag: IndexRagDocumentUseCase,
    private readonly listRag: ListRagDocumentsUseCase,
    private readonly queryRag: QueryRagDocumentUseCase,
    private readonly createConversationUseCase: CreateConversationUseCase,
    private readonly getConversationMessagesUseCase: GetConversationMessagesUseCase,
    private readonly deleteConversationUseCase: DeleteConversationUseCase,
    private readonly getDocumentChunksUseCase: GetDocumentChunksUseCase,
    private readonly filterKnowledgeUseCase: FilterKnowledgeUseCase,
    private readonly getPromptPreferenceUseCase: GetPromptPreferenceUseCase,
    private readonly savePromptPreferenceUseCase: SavePromptPreferenceUseCase,
  ) {}

  @Get('documents')
  async listDocuments() {
    return this.listRag.run();
  }

  @Post('upload-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(@UploadedFile() file: Express.Multer.File) {
    const fileId = file.originalname.replace(/\s+/g, '-').replace(/\.[^.]+$/, '') + '-' + Date.now();
    const result = await this.indexRag.runFromPdf(fileId, file.buffer);
    return { fileId, ...result };
  }

  @Post('index-text')
  async indexText(@Body() body: IndexTextBodyDto) {
    const result = await this.indexRag.runFromText(body.fileId, body.text);
    return { fileId: body.fileId, ...result };
  }

  @Post('query')
  async query(@Body() body: QueryBodyDto) {
    return this.queryRag.run(
      body.fileId,
      body.question,
      body.topK ?? 5,
      body.conversationId,
      body.customInstructions,
    );
  }

  @Post('documents/:fileId/conversations')
  async createConversation(@Param('fileId') fileId: string) {
    return this.createConversationUseCase.run(fileId);
  }

  @Get('conversations/:conversationId/messages')
  async getConversationMessages(@Param('conversationId') conversationId: string) {
    return this.getConversationMessagesUseCase.run(conversationId);
  }

  @Delete('conversations/:conversationId')
  async deleteConversation(@Param('conversationId') conversationId: string) {
    await this.deleteConversationUseCase.run(conversationId);
    return { success: true };
  }

  @Get('documents/:fileId/chunks')
  async getDocumentChunks(@Param('fileId') fileId: string) {
    return this.getDocumentChunksUseCase.run(fileId);
  }

  @Post('filter')
  async filterKnowledge(@Body() body: FilterBodyDto) {
    return this.filterKnowledgeUseCase.run(body.filterDescription);
  }

  @Get('documents/:fileId/prompt-preference')
  async getPromptPreference(@Param('fileId') fileId: string) {
    return this.getPromptPreferenceUseCase.run(fileId);
  }

  @Put('documents/:fileId/prompt-preference')
  async savePromptPreference(
    @Param('fileId') fileId: string,
    @Body() body: { customInstructions: string | null },
  ) {
    await this.savePromptPreferenceUseCase.run(fileId, body.customInstructions ?? null);
    return { success: true };
  }
}
