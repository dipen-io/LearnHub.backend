// src/file/providers/cloudinary.provider.ts
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { IFileProvider, UploadFileResponse, FileUplaodOptions } from '../file.interface';
import { env } from 'src/config/env.config';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as streamfier from "streamifier";

@Injectable()
export class CloudinaryProvider implements IFileProvider {
  private readonly logger = new Logger(CloudinaryProvider.name)

  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      // secure: true, //enable https
    });
  }

  async uploadFile(file: Express.Multer.File, options?: FileUplaodOptions): Promise<UploadFileResponse> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File buffer is missing!')
    }

    this.logger.log(`Uploading file "${file.originalname}" to Cloudinary folder: ${options.folder} || 'root'`)

    return new Promise<UploadFileResponse>((resolve, reject) => {
      const uploadSteam = cloudinary.uploader.upload_stream(
        { folder: options?.folder || 'courses' },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            this.logger.log(`Cloudinary upload failed: ${error.message}`, error.stack);
            return reject(new InternalServerErrorException('File upload to provier failed')
            )
          }

          if (!result || !result.secure_url || !result.public_id) {
            this.logger.error('Clodinary response is missing', result);
            return reject(new InternalServerErrorException('Invalid response from file provider'));
          }

          this.logger.log(`File "${file.originalname}" uploaded successfuly. Pulic ID: ${result.public_id}`);

          resolve({
            url: result.secure_url,
            key: result.public_id,
          });
        },
      );

      // Proper stream error handing
      const readableStream = streamfier.createReadStream(file.buffer);
      readableStream.pipe(uploadSteam);
      readableStream.on('error', (streamError) => {
        this.logger.log('Error reading file buffer steram', streamError.stack);
        reject(new InternalServerErrorException('Failed to read file uplaod'))
      })
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      this.logger.log(`Deleting file from cloudinary with publicID: ${publicId}`);
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Successfully Deleted file: ${publicId}`);
    } catch (error) {
      this.logger.log(`Failed to delete file ${publicId} from cloudinary`, error);
      throw new InternalServerErrorException('Failed to delete file from provider')
    }
  }
}
