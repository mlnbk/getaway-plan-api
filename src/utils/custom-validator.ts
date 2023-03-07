import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsNonPrimitiveArray(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsNonPrimitiveArray',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          console.log('IsNonPrimitiveArray validator, value', value);
          if (!Array.isArray(value)) {
            return false;
          }
          for (const element of value) {
            if (typeof element !== 'object' || Array.isArray(element)) {
              return false;
            }
          }
          return true;
        },
        defaultMessage() {
          return '$property non primitive array has to contain object values';
        },
      },
    });
  };
}
