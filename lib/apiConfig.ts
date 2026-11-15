import { NextResponse } from "next/server";

/**
 * Standard HTTP Status Codes
 */
export const HTTP_STATUS = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * Alias for HTTP_STATUS
 */
export const STATUS_CODES = HTTP_STATUS;

export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

/**
 * Standard API Messages
 */
export const API_MESSAGES = {
  // Top-level / Common shortcuts
  SUCCESS: "Success",
  SERVER_ERROR: "Internal Server Error",
  BAD_REQUEST: "Bad request",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not found",
  METHOD_NOT_ALLOWED: "Method not allowed",
  RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
  INVALID_JSON: "Invalid JSON format",
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again.",

  // Namespaced categories
  AUTH: {
    UNAUTHORIZED: "Unauthorized",
    FORBIDDEN: "Forbidden",
    INVALID_TOKEN: "Invalid token",
    MISSING_TOKEN: "Authorization token is missing",
    API_KEY_MISSING: "API key is missing",
    INVALID_API_KEY: "Invalid or revoked API key",
    IP_DENIED: "Access denied. Authorized IPs only.",
    IDENTIFICATION_FAILURE: "Identification failure",
    ADMIN_PIN_INVALID: "Forbidden: Invalid Admin PIN",
    ADMIN_REQUIRED: "Admin access required",
    PIN_VERIFIED: "PIN verified.",
    WRONG_PIN: "Wrong PIN. Please try again.",
    SESSION_EXPIRED: "Session expired. Please log in again.",
  },

  USER: {
    NOT_FOUND: "User not found",
    ALREADY_EXISTS: "User already exists",
    UPDATED: "User updated successfully",
    PHONE_REQUIRED: "Phone number is required",
    PHONE_UPDATED: "Phone number updated successfully",
    MAX_KEYS_REACHED: "Maximum limit reached. You can only have 2 active API keys.",
  },

  ORDER: {
    NOT_FOUND: "Order not found",
    CREATED: "Order placed successfully",
    FAILED: "Order failed",
    PROCESSING: "Order is processing",
    INVALID_SLUG: "Invalid game or item slug",
    INSUFFICIENT_BALANCE: "Insufficient wallet balance",
    MISSING_FIELDS: "Missing required fields (gameSlug, itemSlug, playerId)",
    INVALID_PLAYER: "Invalid Player ID or Server ID.",
    ORDER_ACCESS_DENIED: "Order not found or access denied",
    REGION_NOT_ALLOWED: (region: string) => `Orders from ${region} region are not allowed for this product.`,
    VALIDATION_FAILED: (msg?: string) => msg ? `Validation failed: ${msg}` : "Validation failed.",
  },

  WALLET: {
    NOT_FOUND: "Wallet not found",
    INSUFFICIENT_BALANCE: "Insufficient balance",
    TRANSACTION_FAILED: "Transaction failed",
    AMOUNT_REQUIRED: "Amount is required",
    INVALID_AMOUNT: "Invalid amount",
    MIN_DEPOSIT: (min: number | string, unit = "USDT") => `Minimum deposit is ${min} ${unit}`,
    DEPOSIT_NOT_FOUND: "Deposit not found",
    DEPOSIT_CONFIRMED: "Deposit already confirmed",
    DEPOSIT_STATUS_INVALID: (status: string) => `Deposit is ${status}. Please create a new deposit.`,
    HASH_ALREADY_SUBMITTED: "This transaction hash has already been submitted",
    INVALID_HASH: "Invalid transaction hash format",
    INVALID_NETWORK: "Invalid network. Only BEP20 is supported at this time.",
    USDT_INITIATE_FAILED: "Failed to initiate USDT deposit",
    DEPOSIT_ID_REQUIRED: "depositId required",
    DEPOSIT_TX_REQUIRED: "depositId and txHash are required",
  },

  BLOCKLIST: {
    TYPE_VALUE_REQUIRED: "Type and value are required",
    INVALID_TYPE: "Invalid type",
    ALREADY_EXISTS: "This item is already blocklisted",
    ADDED: "Added to blocklist successfully",
    REMOVED: "Removed from blocklist successfully",
    ID_REQUIRED: "ID is required",
    ITEM_NOT_FOUND: "Item not found",
  },

  VALIDATION: {
    REQUIRED_FIELDS: "Missing required fields",
    INVALID_INPUT: "Invalid input provided",
    ID_REQUIRED: "ID is required",
  },
} as const;

/**
 * Standard Success Response Helper
 */
export function apiSuccess<T = any>(
  data?: T,
  message: string = API_MESSAGES.SUCCESS,
  status: HttpStatusCode = HTTP_STATUS.OK,
  extra?: Record<string, any>
) {
  const payload: Record<string, any> = {
    success: true,
    message,
    ...extra,
  };

  if (data !== undefined) {
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      Object.assign(payload, data);
    } else {
      payload.data = data;
    }
  }

  return NextResponse.json(payload, { status });
}

/**
 * Standard Error Response Helper
 */
export function apiError(
  message: string = API_MESSAGES.SERVER_ERROR,
  status: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  extra?: Record<string, any>
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...extra,
    },
    { status }
  );
}

export const apiResponse = {
  success: apiSuccess,
  error: apiError,
};

export default {
  HTTP_STATUS,
  STATUS_CODES,
  API_MESSAGES,
  apiSuccess,
  apiError,
  apiResponse,
};
