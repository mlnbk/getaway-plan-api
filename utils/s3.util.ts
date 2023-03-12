import { Logger } from '@nestjs/common';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';

interface IUpload {
  Bucket: string;
  file: Express.Multer.File;
}

export class S3Util {
  logger: Logger = new Logger('S3Util');
  s3: S3Client;
  constructor() {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY as string,
      },
      region: process.env.AWS_S3_REGION as string,
    });
  }

  async upload({ Bucket, file }: IUpload) {
    try {
      const parameters: PutObjectCommandInput = {
        Bucket: Bucket,
        Key: file.originalname,
        ContentType: file.mimetype,
        Body: file.buffer,
      };
      const command = new PutObjectCommand(parameters);
      await this.s3.send(command);
      return this.getUrl(Bucket, file.originalname);
    } catch (error) {
      this.logger.error('S3 Util upload error', { error });
    }
  }

  private getUrl(bucket: string, filename: string) {
    const transformedFilename = filename.replace(' ', '+');
    return `https://${bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${transformedFilename}`;
  }
}
