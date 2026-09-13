import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

interface ErrorResponseBody {
  statusCode: number;
  code: string;
  message: string;
  requestId: string;
}

const STATUS_CODE_TO_ERROR_CODE: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'VALIDATION_ERROR',
  [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMITED',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId =
      (request.headers['x-request-id'] as string) || randomUUID();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred.';
    let code = STATUS_CODE_TO_ERROR_CODE[statusCode];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const body = exceptionResponse as Record<string, unknown>;
        const rawMessage = body.message;
        message = Array.isArray(rawMessage)
          ? rawMessage.join(' ')
          : ((rawMessage as string) ?? exception.message);
      } else {
        message = exception.message;
      }

      code =
        ((typeof exceptionResponse === 'object' &&
          exceptionResponse !== null &&
          (exceptionResponse as Record<string, unknown>).code) as string) ||
        STATUS_CODE_TO_ERROR_CODE[statusCode] ||
        'ERROR';
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack, requestId);
    }

    const body: ErrorResponseBody = {
      statusCode,
      code,
      message,
      requestId,
    };

    response.status(statusCode).json(body);
  }
}
