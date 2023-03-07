import { Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';

interface IUpload {
  Bucket: string;
  file: Express.Multer.File;
}

export class S3Util {
  logger: Logger = new Logger('S3Util');
  s3: S3;
  constructor() {
    this.s3 = new S3({
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_S3_SECRECT_KEY as string,
      },
      region: process.env.AWS_SQS_REGION as string,
    });
  }

  async upload({
    Bucket,
    file,
  }: IUpload): Promise<S3.ManagedUpload.SendData | undefined> {
    try {
      const parameters = {
        Bucket: Bucket,
        Key: file.originalname,
        ContentType: file.mimetype,
        Body: file.buffer,
      };

      return this.s3.upload(parameters).promise();
    } catch (error) {
      this.logger.error('S3 Util upload error', { error });
    }
  }

  async downloadFileFromS3(
    key: string,
  ): Promise<S3.GetObjectOutput | undefined> {
    try {
      const s3Parameters: S3.Types.GetObjectRequest = {
        Bucket: 'your-bucket-name',
        Key: key,
      };

      return this.s3.getObject(s3Parameters).promise();
    } catch (error) {
      this.logger.error('S3 Util download error', { error });
    }
  }

  async deleteFileFromS3(key: string): Promise<void> {
    try {
      const s3Parameters: S3.Types.DeleteObjectRequest = {
        Bucket: 'your-bucket-name',
        Key: key,
      };

      await this.s3.deleteObject(s3Parameters).promise();
    } catch (error) {
      this.logger.error('S3 Util delete error', { error });
    }
  }
}
