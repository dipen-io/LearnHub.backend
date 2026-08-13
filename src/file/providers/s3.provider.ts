// src/file/providers/s3.provider.ts
/*
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { IFileProvider, UploadFileResponse } from '../file.interface';

export class S3Provider implements IFileProvider {
  private client: S3Client;

  constructor(
    private bucket: string,
    private region: string,
    private acl = 'public-read',
  ) {
    this.client = new S3Client({ region });
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadFileResponse> {
    const key = `${Date.now()}-${uuid()}-${file.originalname}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: this.acl,
      }),
    );
    return {
      key,
      url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
    };
  }

  async deleteFile(key: string) {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
*/
