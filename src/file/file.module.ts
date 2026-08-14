import {Module, Global } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { FileService } from "./file.service";

@Global()
@Module({
    imports: [ConfigModule, MulterModule.register({})],
    providers: [FileService],
    exports: [FileService]
})

export class FileModule {};

