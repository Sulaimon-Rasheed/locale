import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  //catch method
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof BadRequestException) {
      const responseBody = exception.getResponse() as {
        message: any;
        statusCode: number;
        error: string;
      };

      if (Array.isArray(responseBody.message) &&
        responseBody.message.every((msg) => this.isValidationError(msg))
      ) {
        const validationErrors = this.flattenValidationErrors(
          responseBody.message as ValidationError[],
        );
        return response.status(status).json({
          statusCode: status,
          message: validationErrors,
        });
      }
    }
    response.status(status).json({
      statusCode: status,
      message: exception.message || 'Something broke. Try later',
    });
  }

  //isValidationError method
  private isValidationError(obj: any): obj is ValidationError {
    return obj && typeof obj === 'object' && 'constraints' in obj;
  }

  //flattenValidationErrors method
  private flattenValidationErrors(validationErrors: ValidationError[],): string[] {
    const messages: string[] = [];
    for (const error of validationErrors) {
      if (error.constraints) {
        messages.push(...Object.values(error.constraints));
      }
      if (error.children && error.children.length) {
        messages.push(...this.flattenValidationErrors(error.children));
      }
    }
    return messages;
  }

}
