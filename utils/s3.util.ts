import { Logger } from '@nestjs/common';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  getSignedUrl,
  S3RequestPresigner,
} from '@aws-sdk/s3-request-presigner';

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
      console.log(process.env);
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

  // async downloadFileFromS3(
  //   key: string,
  // ): Promise<S3.GetObjectOutput | undefined> {
  //   try {
  //     const s3Parameters: S3.Types.GetObjectRequest = {
  //       Bucket: 'your-bucket-name',
  //       Key: key,
  //     };

  //     return this.s3.getObject(s3Parameters).promise();
  //   } catch (error) {
  //     this.logger.error('S3 Util download error', { error });
  //   }
  // }

  // async deleteFileFromS3(key: string): Promise<void> {
  //   try {
  //     const s3Parameters: S3.Types.DeleteObjectRequest = {
  //       Bucket: 'your-bucket-name',
  //       Key: key,
  //     };

  //     await this.s3.deleteObject(s3Parameters).promise();
  //   } catch (error) {
  //     this.logger.error('S3 Util delete error', { error });
  //   }
  // }

  private getUrl(bucket: string, filename: string) {
    return `https://${bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${filename}`;
  }
}
