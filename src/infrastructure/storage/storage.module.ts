import { Module } from '@nestjs/common';
import { DOCUMENT_STORAGE } from '../../application/ports/document-storage.port';
import { GcsDocumentStorageService } from './gcs-document-storage.service';
import { LocalDocumentStorageService } from './local-document-storage.service';

const useGcs = !!process.env.GCP_BUCKET_NAME;
const StorageServiceClass = useGcs ? GcsDocumentStorageService : LocalDocumentStorageService;

@Module({
  providers: [
    StorageServiceClass,
    { provide: DOCUMENT_STORAGE, useExisting: StorageServiceClass },
  ],
  exports: [DOCUMENT_STORAGE],
})
export class StorageModule {}
