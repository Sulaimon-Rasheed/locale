import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

// Define the custom validator logic
@ValidatorConstraint({ async: false })
export class IsEmailConstraint implements ValidatorConstraintInterface {
  validate(email: any, args: ValidationArguments) {
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && emailRegex.test(email);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Email is not valid';
  }
}

// Create a decorator using the custom validator logic
export function IsEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailConstraint,
    });
  };
}