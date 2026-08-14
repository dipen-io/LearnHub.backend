import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer"

export function getFileInterceptor(fieldName: string) {
    return FileInterceptor(fieldName, {
        storage: memoryStorage(),
        limits: {fileSize: 5 * 1024 * 1024}, // 5mb
    })
}
