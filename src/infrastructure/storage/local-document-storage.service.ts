import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import type { Readable } from 'stream';
import type { IDocumentStorage } from '../../application/ports/document-storage.port';

@Injectable()
export class LocalDocumentStorageService implements IDocumentStorage {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
  }

  private filePath(fileId: string, extension: string): string {
    return path.join(this.uploadDir, `${fileId}.${extension}`);
  }

  async upload(fileId: string, buffer: Buffer, extension: string): Promise<void> {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    fs.writeFileSync(this.filePath(fileId, extension), buffer);
  }

  async delete(fileId: string, extension: string): Promise<void> {
    const filePath = this.filePath(fileId, extension);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async getStream(fileId: string, extension: string): Promise<Readable | null> {
    const filePath = this.filePath(fileId, extension);
    if (!fs.existsSync(filePath)) return null;
    return fs.createReadStream(filePath);
  }

  async getSignedUrl(_fileId: string, _extension: string, _expiresInSeconds?: number): Promise<string | null> {
    return null;
  }
}
