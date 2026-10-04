/**
 * Application error with a stable machine-readable code, satisfying the API
 * error contract (TPRD §17). Raw stack traces are never returned to clients.
 */
export class AppError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly details?: unknown;
  readonly expose: boolean;

  constructor(
    code: string,
    message: string,
    options: { httpStatus?: number; details?: unknown; expose?: boolean } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = options.httpStatus ?? 400;
    this.details = options.details;
    this.expose = options.expose ?? true;
  }
}

export const errorFactories = {
  unauthorized: (message = 'Authentication is required.') =>
    new AppError('UNAUTHORIZED', message, { httpStatus: 401 }),
  forbidden: (message = 'You do not have permission to perform this action.') =>
    new AppError('FORBIDDEN', message, { httpStatus: 403 }),
  notFound: (code: string, message: string) => new AppError(code, message, { httpStatus: 404 }),
  validation: (message = 'The request was invalid.', details?: unknown) =>
    new AppError('VALIDATION_ERROR', message, { httpStatus: 422, details }),
  conflict: (code: string, message: string) => new AppError(code, message, { httpStatus: 409 }),
  paymentRequired: (message: string, details?: unknown) =>
    new AppError('PAYMENT_REQUIRED', message, { httpStatus: 402, details }),
  rateLimited: (message = 'Too many requests.') =>
    new AppError('RATE_LIMITED', message, { httpStatus: 429 }),
  unavailable: (message: string, details?: unknown) =>
    new AppError('SERVICE_UNAVAILABLE', message, { httpStatus: 503, details }),
  internal: (message = 'An unexpected error occurred.') =>
    new AppError('INTERNAL_ERROR', message, { httpStatus: 500, expose: false }),
};

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
