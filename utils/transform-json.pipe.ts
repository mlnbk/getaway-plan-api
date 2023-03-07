/* eslint-disable @typescript-eslint/ban-types */
import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class TransformJsonPipe implements PipeTransform {
  // transform(value: any) {
  //   try {
  //     console.log('TransformJsonPipe,', value);
  //     return JSON.parse(value);
  //   } catch {
  //     throw new BadRequestException('Invalid JSON string');
  //   }
  // }

  async transform(value: any, { metatype }: ArgumentMetadata) {
    console.log('vla', value, metatype);
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
