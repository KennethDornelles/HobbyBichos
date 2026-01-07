import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsDecimal(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDecimal',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && /^\d+(\.\d+)?$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve ser um número decimal válido.`;
        },
      },
    });
  };
}
