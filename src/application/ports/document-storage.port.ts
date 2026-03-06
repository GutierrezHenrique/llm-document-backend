import type { Readable } from 'stream';

/**
 * Port for storing document files (e.g. PDFs).
 * Implementations can use local disk or GCP Cloud Storage.
 */
export const DOCUMENT_STORAGE = Symbol('DOCUMENT_STORAGE');

export interface IDocumentStorage {
  /** Upload a document file. Key = fileId + extension (e.g. "doc-123.pdf"). */
  upload(fileId: string, buffer: Buffer, extension: string): Promise<void>;

  /** Remove a stored document file. */
  delete(fileId: string, extension: string): Promise<void>;

  /** Get a read stream for the stored file. Resolves with null if not found. */
  getStream(fileId: string, extension: string): Promise<Readable | null>;

  /**
   * Get a signed URL for direct access (e.g. GCS). When null, caller should use getStream.
   * @param expiresInSeconds validity in seconds (default 3600 = 1 hour).
   */
  getSignedUrl(fileId: string, extension: string, expiresInSeconds?: number): Promise<string | null>;
}
