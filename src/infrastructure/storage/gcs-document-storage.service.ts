import { Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { Storage } from '@google-cloud/storage';
import type { IDocumentStorage } from '../../application/ports/document-storage.port';

@Injectable()
export class GcsDocumentStorageService implements IDocumentStorage {
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor() {
    this.bucketName = process.env.GCP_BUCKET_NAME ?? '';
    if (!this.bucketName) {
      throw new Error(
        'GCP_BUCKET_NAME must be set to use GCS document storage. ' +
          'Create a bucket in Google Cloud Storage and set the env var.',
      );
    }
    const storageOptions = this.getStorageOptions();
    this.storage = new Storage(storageOptions);
  }

  private getStorageOptions(): ConstructorParameters<typeof Storage>[0] {
    const base64FromVar = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
    const credsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    const tryBase64AsCredentials = (base64: string): ConstructorParameters<typeof Storage>[0] | null => {
      if (!base64 || base64.length < 50) return null;
      try {
        const json = Buffer.from(base64, 'base64').toString('utf-8');
        const credentials = JSON.parse(json) as Record<string, unknown>;
        if (credentials && (credentials.private_key || credentials.client_email)) {
          return { credentials };
        }
      } catch {
        // not valid base64 JSON
      }
      return null;
    };

    if (base64FromVar) {
      const opts = tryBase64AsCredentials(base64FromVar);
      if (opts) return opts;
      throw new Error(
        'GOOGLE_APPLICATION_CREDENTIALS_BASE64 must be a valid base64-encoded JSON service account key.',
      );
    }

    if (credsEnv) {
      const isExistingFile = existsSync(credsEnv);
      if (!isExistingFile) {
        const opts = tryBase64AsCredentials(credsEnv);
        if (opts) return opts;
      }
      return { keyFilename: credsEnv };
    }
    return {};
  }

  private objectName(fileId: string, extension: string): string {
    return `documents/${fileId}.${extension}`;
  }

  async upload(fileId: string, buffer: Buffer, extension: string): Promise<void> {
    const name = this.objectName(fileId, extension);
    const file = this.storage.bucket(this.bucketName).file(name);
    await file.save(buffer, {
      contentType: extension === 'pdf' ? 'application/pdf' : 'application/octet-stream',
    });
  }

  async delete(fileId: string, extension: string): Promise<void> {
    const name = this.objectName(fileId, extension);
    await this.storage.bucket(this.bucketName).file(name).delete({ ignoreNotFound: true });
  }

  async getStream(fileId: string, extension: string): Promise<import('stream').Readable | null> {
    const name = this.objectName(fileId, extension);
    const file = this.storage.bucket(this.bucketName).file(name);
    const [exists] = await file.exists();
    if (!exists) return null;
    return file.createReadStream();
  }

  async getSignedUrl(
    fileId: string,
    extension: string,
    expiresInSeconds = 3600,
  ): Promise<string | null> {
    const name = this.objectName(fileId, extension);
    const file = this.storage.bucket(this.bucketName).file(name);
    const [exists] = await file.exists();
    if (!exists) return null;
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresInSeconds * 1000,
    });
    return url;
  }
}
