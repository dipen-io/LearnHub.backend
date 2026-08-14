import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import { IFileProvider, UploadFileResponse } from '../file.interface';

export class LocalProvider implements IFileProvider {
  constructor(private dest = './uploads') {}

  async uploadFile(file: Express.Multer.File): Promise<UploadFileResponse> {
    // Ensure Uplaod Directory Exist!
    if (!existsSync(this.dest)) {
          mkdirSync(this.dest, { recursive: true});
     }
    const filename = `${Date.now()}-${uuid()}-${file.originalname}`;
    const filepath = join(this.dest, filename);

    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(filepath);
      stream.write(file.buffer);
      stream.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return {
      url: `/uploads/${filename}`,
      path: filepath,
    };
  }

  async deleteFile(path: string) {
    const fs = await import('fs/promises');
    await fs.unlink(path).catch(() => null);
  }
}

