// src/file/file.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileUplaodOptions, IFileProvider, UploadFileResponse } from './file.interface';
import { LocalProvider } from './providers/local.provider';
import { CloudinaryProvider } from './providers/cloudinary.provider';

@Injectable()
export class FileService implements IFileProvider {
  private provider: IFileProvider;

  constructor(private config: ConfigService) {
    const storage = (config.get<string>('FILE_STORAGE') || 'local').toLowerCase();

    switch (storage) {
      case 's3': {
        try {
          // Dynamically require so TS doesn’t check it
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
          const { S3Provider } = require('./providers/s3.provider');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          this.provider = new S3Provider(
            config.get('AWS_BUCKET'),
            config.get('AWS_REGION'),
            config.get('AWS_ACL'),
          );
        } catch (err) {
          console.log("ERR: ",err)
          console.warn('⚠️ S3 provider not found. Falling back to LocalProvider.');
          this.provider = new LocalProvider(config.get('UPLOAD_DEST'));
        }
        break;
      }

      case 'cloudinary': {
        try {
          // const { CloudinaryProvider } = require('./providers/cloudinary.provider');
          this.provider = new CloudinaryProvider();
        } catch (err) {
          console.log("ERR: ",err)
          console.warn('⚠️ Cloudinary provider not found. Falling back to LocalProvider.');
          this.provider = new LocalProvider(config.get('UPLOAD_DEST'));
        }
        break;
      }

      case 'supabase': {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
          const { SupabaseProvider } = require('./providers/supabase.provider');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          this.provider = new SupabaseProvider(
            config.get('SUPABASE_URL'),
            config.get('SUPABASE_KEY'),
            config.get('SUPABASE_BUCKET'),
          );
        } catch (err) {
          console.log("ERR: ",err)
          console.warn('⚠️ Supabase provider not found. Falling back to LocalProvider.');
          this.provider = new LocalProvider(config.get('UPLOAD_DEST'));
        }
        break;
      }

      default:
        this.provider = new LocalProvider(config.get('UPLOAD_DEST'));
        break;
    }
  }

  async uploadFile(file: Express.Multer.File, options?: FileUplaodOptions): Promise<UploadFileResponse> {
    return this.provider.uploadFile(file, options);
  }

  async deleteFile(keyOrPath: string): Promise<void> {
    if (this.provider.deleteFile) {
      await this.provider.deleteFile(keyOrPath);
    }
  }
}

