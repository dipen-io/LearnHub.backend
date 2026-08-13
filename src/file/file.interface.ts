import 'multer';

export interface UploadFileResponse {
    url: string;
    key?: string;
    path?: string;
}

export interface FileUplaodOptions {
    folder? : string;
}

export interface IFileProvider {
    uploadFile(file: Express.Multer.File, options?: FileUplaodOptions): Promise<UploadFileResponse>;
    deleteFile?(keyOrPath: string): Promise<void>;
}
