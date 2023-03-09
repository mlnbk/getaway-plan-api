import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class TransformJsonPipe implements PipeTransform {
  transform(value: any) {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      throw new BadRequestException('Invalid JSON string');
    }
  }
}
