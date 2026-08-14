// src/file/providers/supabase.provider.ts
/*
import { createClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';
import { IFileProvider, UploadFileResponse} from '../file.interface';

export class SupabaseProvider implements IFileProvider {
  private client;
  private bucket: string;

  constructor(url: string, key: string, bucket: string) {
    this.client = createClient(url, key);
    this.bucket = bucket;
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadFileResponse> {
    const filename = `${Date.now()}-${uuid()}-${file.originalname}`;
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    const { data: urlData } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(filename);

    return { url: urlData.publicUrl, key: filename };
  }

  async deleteFile(filename: string) {
    await this.client.storage.from(this.bucket).remove([filename]);
  }
}
*/
