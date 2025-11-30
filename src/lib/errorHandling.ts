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