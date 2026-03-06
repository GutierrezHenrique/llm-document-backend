import { Controller, Get, Param, Res, NotFoundException, Inject } from '@nestjs/common';
import { Response } from 'express';
import { DOCUMENT_STORAGE } from '../../application/ports/document-storage.port';
import type { IDocumentStorage } from '../../application/ports/document-storage.port';

const CONTENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
};

@Controller('uploads')
export class UploadsController {
  constructor(
    @Inject(DOCUMENT_STORAGE) private readonly documentStorage: IDocumentStorage,
  ) {}

  @Get(':filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response): Promise<void> {
    const lastDot = filename.lastIndexOf('.');
    const fileId = lastDot === -1 ? filename : filename.slice(0, lastDot);
    const extension = lastDot === -1 ? '' : filename.slice(lastDot + 1).toLowerCase();

    if (!fileId || !extension) {
      throw new NotFoundException('File not found');
    }

    const signedUrl = await this.documentStorage.getSignedUrl(fileId, extension, 3600);
    if (signedUrl) {
      res.redirect(302, signedUrl);
      return;
    }

    const stream = await this.documentStorage.getStream(fileId, extension);
    if (!stream) {
      throw new NotFoundException('File not found');
    }

    const contentType = CONTENT_TYPES[extension] ?? 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    stream.pipe(res);
  }
}
