// Centralized error handling utilities

export interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
}

export interface SuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

export type ApiResponse<T = unknown> = ErrorResponse | SuccessResponse<T>;

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toResponse(): ErrorResponse {
    return {
      success: false,
      message: this.message,
      code: this.code,
      details: this.details
    };
  }
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: unknown
): Response {
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    code,
    details
  };

  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  statusCode: number = 200
): Response {
  const successResponse: SuccessResponse<T> = {
    success: true,
    data,
    message
  };

  return new Response(JSON.stringify(successResponse), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return new Response(JSON.stringify(error.toResponse()), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Zod throws on .parse() failures; surface the first issue as a clean
  // 400 instead of dumping the raw issue array as a 500.
  if (error instanceof Error && error.name === 'ZodError') {
    const issues = (error as unknown as { errors?: { message: string }[] }).errors;
    const message = issues?.[0]?.message || 'Invalid input';
    return createErrorResponse(message, 400, 'VALIDATION_ERROR');
  }

  if (error instanceof Error) {
    return createErrorResponse(
      error.message,
      500,
      'INTERNAL_ERROR'
    );
  }

  return createErrorResponse(
    'An unexpected error occurred',
    500,
    'UNKNOWN_ERROR'
  );
}

// Client-side error handling
export function handleClientError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

// Form submission error handling
export async function handleFormSubmission<T = unknown>(
  url: string,
  data: Record<string, unknown>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (result: SuccessResponse<T>) => void;
    onError?: (error: string) => void;
  } = {}
): Promise<{ success: boolean; message: string; data?: T }> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      const errorMsg = result.message || options.errorMessage || 'Request failed';
      options.onError?.(errorMsg);
      return { success: false, message: errorMsg };
    }

    const successMsg = result.message || options.successMessage || 'Success';
    options.onSuccess?.(result);
    return { success: true, message: successMsg, data: result.data };

  } catch (error) {
    const errorMsg = handleClientError(error);
    options.onError?.(errorMsg);
    return { success: false, message: errorMsg };
  }
}
/**
 * Human-readable message for the first validation issue.
 *
 * Schemas give their own messages for format/length rules, but a field that
 * is missing altogether (or has the wrong type) falls back to the validator's
 * generic "Invalid input: expected string, received undefined". Turn that
 * into "<Field> is required" instead.
 */
export function validationMessage(issue: { code?: string; message: string; path?: PropertyKey[] } | undefined): string {
  if (!issue) return 'Invalid request';
  if (issue.code === 'invalid_type' && issue.message.startsWith('Invalid input')) {
    const field = String(issue.path?.[0] ?? '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').toLowerCase();
    return field ? `${field.charAt(0).toUpperCase()}${field.slice(1)} is required` : 'A required field is missing';
  }
  return issue.message;
}
