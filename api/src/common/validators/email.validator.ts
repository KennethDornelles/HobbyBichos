import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsStrictEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrictEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          // Não pode ter espaços no início/fim
          if (value.trim() !== value) return false;
          // Não pode conter caracteres especiais inválidos
          if (/[<>\(\)\[\];:,"\s]/.test(value)) return false;
          // Não pode ter pontos consecutivos
          if (value.includes('..')) return false;
          // Deve ter exatamente um @
          if ((value.match(/@/g) || []).length !== 1) return false;
          // Regex rigoroso para email
          const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
          if (!emailRegex.test(value)) return false;
          // Domínio deve ter extensão válida (mínimo 2 caracteres)
          const domain = value.split('@')[1];
          if (!domain || domain.split('.').pop()!.length < 2) return false;
          return true;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'Email inválido';
        },
      },
    });
  };
}
