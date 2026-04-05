var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
function sanitizeInput(input, maxLength = 1e3) {
  if (!input || typeof input !== "string") return "";
  return input.trim().substring(0, maxLength).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/javascript:/gi, "").replace(/on\w+\s*=/gi, "");
}
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 6e4) {
    __publicField(this, "requests", /* @__PURE__ */ new Map());
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  isAllowed(identifier) {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter((time) => now - time < this.windowMs);
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
  reset(identifier) {
    this.requests.delete(identifier);
  }
}
const globalRateLimiter = new RateLimiter(50, 6e4);
class ApiError extends Error {
  constructor(message, statusCode = 500, code, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "ApiError";
  }
  toResponse() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      details: this.details
    };
  }
}
function createErrorResponse(message, statusCode = 500, code, details) {
  const errorResponse = {
    success: false,
    message,
    code,
    details
  };
  return new Response(JSON.stringify(errorResponse), {
    status: statusCode,
    headers: { "Content-Type": "application/json" }
  });
}
function createSuccessResponse(data, message, statusCode = 200) {
  const successResponse = {
    success: true,
    data,
    message
  };
  return new Response(JSON.stringify(successResponse), {
    status: statusCode,
    headers: { "Content-Type": "application/json" }
  });
}
function handleApiError(error) {
  if (error instanceof ApiError) {
    return new Response(JSON.stringify(error.toResponse()), {
      status: error.statusCode,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (error instanceof Error) {
    return createErrorResponse(
      error.message,
      500,
      "INTERNAL_ERROR"
    );
  }
  return createErrorResponse(
    "An unexpected error occurred",
    500,
    "UNKNOWN_ERROR"
  );
}
export {
  createSuccessResponse as a,
  createErrorResponse as c,
  globalRateLimiter as g,
  handleApiError as h,
  sanitizeInput as s
};
