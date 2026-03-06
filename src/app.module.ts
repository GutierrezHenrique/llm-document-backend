import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { RagModule } from './modules/rag/rag.module';
import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [CommonModule, RagModule, UploadsModule],
})
export class AppModule {}
