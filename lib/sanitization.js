/**
 * Input Sanitization Utility
 * 
 * Prevents XSS (Cross-Site Scripting) attacks by sanitizing user input
 * Note: This project intentionally avoids DOM-based sanitizers on the server
 * (e.g. jsdom-backed DOMPurify) because they can cause runtime bundling issues
 * in some serverless environments. We use a conservative string sanitizer
 * instead: it strips HTML and dangerous patterns and is safe for plain-text
 * fields (names/emails/addresses/etc).
 */

/**
 * DOMPurify configuration
 * Allows safe HTML tags while removing dangerous ones
 */
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"],
  ALLOWED_ATTR: ["href", "title", "target"],
  ALLOW_DATA_ATTR: false,
  KEEP_CONTENT: true,
};

/**
 * Strict config - no HTML allowed, plain text only
 */
const STRICT_PURIFY_CONFIG = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
  KEEP_CONTENT: true,
};

/**
 * Sanitize a single string value
 * Removes potentially dangerous HTML/JavaScript
 * 
 * @param {string} value - The input string to sanitize
 * @param {object} options - Sanitization options
 * @param {boolean} options.strict - If true, removes all HTML tags (default: false)
 * @param {object} options.config - Custom DOMPurify config
 * @returns {string} Sanitized string
 */
export function sanitizeString(value, options = {}) {
  if (!value) return "";
  if (typeof value !== "string") return String(value);

  const { strict = false } = options;

  // 1) Normalize
  let out = value;

  // 2) Strip HTML tags (conservative; we treat all inputs as plain text)
  out = out.replace(/<\/?[^>]+>/g, "");

  // 3) Remove common XSS vectors in text contexts
  out = out.replace(/javascript:/gi, "");
  out = out.replace(/data:text\/html/gi, "");

  // 4) In strict mode, also remove angle brackets and quotes entirely
  if (strict) {
    out = out.replace(/[<>"'`]/g, "");
  }

  // 5) Trim and collapse whitespace
  out = out.replace(/\s+/g, " ").trim();

  return out;
}

/**
 * Sanitize an object with multiple fields
 * 
 * @param {object} data - Object containing fields to sanitize
 * @param {string[]} fields - Array of field names to sanitize (if not provided, sanitizes all string fields)
 * @param {object} options - Sanitization options
 * @returns {object} Object with sanitized fields
 */
export function sanitizeObject(data, fields = null, options = {}) {
  if (!data || typeof data !== "object") return data;

  const sanitized = { ...data };
  const fieldsToSanitize = fields || Object.keys(data);

  for (const field of fieldsToSanitize) {
    if (data[field] !== undefined) {
      if (typeof data[field] === "string") {
        sanitized[field] = sanitizeString(data[field], options);
      } else if (typeof data[field] === "object" && data[field] !== null) {
        // Recursively sanitize nested objects
        sanitized[field] = sanitizeObject(data[field], null, options);
      }
    }
  }

  return sanitized;
}

/**
 * Sanitize text fields (no HTML allowed)
 * Use for: names, emails, phone numbers, descriptions
 * 
 * @param {object} data - Object to sanitize
 * @param {string[]} fields - Fields to sanitize as plain text
 * @returns {object} Sanitized object
 */
export function sanitizeTextFields(data, fields = []) {
  return sanitizeObject(data, fields, { strict: true });
}

/**
 * Sanitize rich text fields (some HTML allowed)
 * Use for: product descriptions, comments, reviews
 * 
 * @param {object} data - Object to sanitize
 * @param {string[]} fields - Fields to sanitize as rich text
 * @returns {object} Sanitized object
 */
export function sanitizeRichTextFields(data, fields = []) {
  return sanitizeObject(data, fields, { strict: false });
}

/**
 * Common field name patterns for sanitization
 */
export const COMMON_TEXT_FIELDS = [
  // User input
  "name",
  "fullName",
  "customerName",
  "email",
  "phone",
  "mobile",
  "contact",
  "address",
  "city",
  "state",
  "country",

  // Product/Order
  "title",
  "productName",
  "description",
  "message",
  "note",
  "notes",
  "comment",
  "comments",
  "instructions",
  "requirements",

  // Form fields
  "subject",
  "body",
  "content",
  "text",
  "query",
  "search",

  // Custom orders
  "colorTheme",
  "color",
  "theme",
  "productType",
  "orderType",
];

export const COMMON_RICH_TEXT_FIELDS = [
  "description",
  "details",
  "content",
  "body",
  "instructions",
  "requirements",
];

/**
 * Sanitize request body fields
 * Automatically sanitizes common fields based on type
 * 
 * @param {object} body - Request body
 * @param {object} config - Configuration
 * @param {string[]} config.textFields - Fields to sanitize as plain text
 * @param {string[]} config.richTextFields - Fields to sanitize with basic HTML
 * @returns {object} Sanitized body
 */
export function sanitizeRequestBody(body, config = {}) {
  if (!body) return body;

  const {
    textFields = COMMON_TEXT_FIELDS,
    richTextFields = COMMON_RICH_TEXT_FIELDS,
  } = config;

  let sanitized = { ...body };

  // First sanitize rich text fields (keeps some HTML)
  sanitized = sanitizeRichTextFields(sanitized, richTextFields);

  // Then sanitize text fields (strips all HTML)
  sanitized = sanitizeTextFields(sanitized, textFields);

  return sanitized;
}

/**
 * Sanitize email address
 * Removes potentially dangerous characters
 * 
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
export function sanitizeEmail(email) {
  if (!email) return "";
  // Remove common XSS attack patterns in emails
  return sanitizeString(email, { strict: true })
    .toLowerCase()
    .replace(/[<>'"]/g, "");
}

/**
 * Sanitize phone number
 * Keeps only digits, +, -, (, )
 * 
 * @param {string} phone - Phone number to sanitize
 * @returns {string} Sanitized phone
 */
export function sanitizePhone(phone) {
  if (!phone) return "";
  return String(phone).replace(/[^0-9+\-()]/g, "");
}

/**
 * Sanitize URL
 * Validates and sanitizes URLs
 * 
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL or empty string if invalid
 */
export function sanitizeURL(url) {
  if (!url) return "";

  try {
    // Only allow http and https protocols
    const urlObj = new URL(url);
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return "";
    }
    return urlObj.toString();
  } catch (error) {
    // Invalid URL
    return "";
  }
}

/**
 * Sanitize number
 * Ensures value is a valid number and within range
 * 
 * @param {any} value - Value to sanitize
 * @param {number} min - Minimum value (default: -Infinity)
 * @param {number} max - Maximum value (default: Infinity)
 * @returns {number} Sanitized number or 0 if invalid
 */
export function sanitizeNumber(value, min = -Infinity, max = Infinity) {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.max(min, Math.min(max, num));
}

/**
 * Sanitize positive number (for prices, quantities, etc.)
 * 
 * @param {any} value - Value to sanitize
 * @param {number} max - Maximum value (default: Infinity)
 * @returns {number} Sanitized positive number
 */
export function sanitizePositiveNumber(value, max = Infinity) {
  return sanitizeNumber(value, 0, max);
}

/**
 * Sanitize boolean
 * 
 * @param {any} value - Value to sanitize
 * @returns {boolean} Sanitized boolean
 */
export function sanitizeBoolean(value) {
  return Boolean(value);
}

/**
 * Sanitize enum value
 * Ensures value is one of allowed options
 * 
 * @param {string} value - Value to check
 * @param {string[]} allowedValues - Allowed values
 * @param {string} defaultValue - Default if not in allowed values
 * @returns {string} Validated enum value
 */
export function sanitizeEnum(value, allowedValues = [], defaultValue = "") {
  if (!value) return defaultValue;
  return allowedValues.includes(value) ? value : defaultValue;
}

/**
 * Sanitize date
 * Validates and returns ISO string
 * 
 * @param {string|Date} date - Date to sanitize
 * @returns {string} ISO date string or empty if invalid
 */
export function sanitizeDate(date) {
  if (!date) return "";
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "";
    return dateObj.toISOString();
  } catch (error) {
    return "";
  }
}

/**
 * High-level helper to sanitize entire request body for common scenarios
 * 
 * Usage example:
 * ```
 * const sanitized = sanitizeRequestBodyAuto(body, {
 *   textFields: ["name", "email"],
 *   strictFields: ["password"],
 *   emailFields: ["email"],
 *   phoneFields: ["phone"],
 *   numberFields: { price: { min: 0, max: 100000 } }
 * });
 * ```
 */
export function sanitizeRequestBodyAuto(body, fieldConfig = {}) {
  if (!body) return body;

  const {
    textFields = [],
    strictFields = [],
    emailFields = [],
    phoneFields = [],
    numberFields = {},
    booleanFields = [],
    dateFields = [],
    enumFields = {},
  } = fieldConfig;

  let sanitized = { ...body };

  // Text fields (HTML allowed)
  for (const field of textFields) {
    if (sanitized[field]) {
      sanitized[field] = sanitizeString(sanitized[field], { strict: false });
    }
  }

  // Strict fields (no HTML)
  for (const field of strictFields) {
    if (sanitized[field]) {
      sanitized[field] = sanitizeString(sanitized[field], { strict: true });
    }
  }

  // Email fields
  for (const field of emailFields) {
    if (sanitized[field]) {
      sanitized[field] = sanitizeEmail(sanitized[field]);
    }
  }

  // Phone fields
  for (const field of phoneFields) {
    if (sanitized[field]) {
      sanitized[field] = sanitizePhone(sanitized[field]);
    }
  }

  // Number fields
  for (const [field, range] of Object.entries(numberFields)) {
    if (sanitized[field] !== undefined) {
      sanitized[field] = sanitizeNumber(
        sanitized[field],
        range.min ?? -Infinity,
        range.max ?? Infinity
      );
    }
  }

  // Boolean fields
  for (const field of booleanFields) {
    if (sanitized[field] !== undefined) {
      sanitized[field] = sanitizeBoolean(sanitized[field]);
    }
  }

  // Date fields
  for (const field of dateFields) {
    if (sanitized[field]) {
      sanitized[field] = sanitizeDate(sanitized[field]);
    }
  }

  // Enum fields
  for (const [field, config] of Object.entries(enumFields)) {
    if (sanitized[field]) {
      sanitized[field] = sanitizeEnum(
        sanitized[field],
        config.allowed,
        config.default
      );
    }
  }

  return sanitized;
}

/**
 * Detect potential XSS attack patterns in input
 * Returns true if suspicious patterns found
 * 
 * @param {any} value - Value to check
 * @returns {boolean} True if potential XSS detected
 */
export function detectXSSPatterns(value) {
  if (!value || typeof value !== "string") return false;

  const xssPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /<svg[^>]*onload/gi,
    /<img[^>]*onerror/gi,
    /on(error|load|mouse|click|focus|blur|change|submit)\s*=/gi,
    /eval\s*\(/gi,
    /data:text\/html/gi,
  ];

  for (const pattern of xssPatterns) {
    if (pattern.test(value)) {
      return true;
    }
  }

  return false;
}

/**
 * Check and warn about potential XSS in request body
 * Useful for logging/monitoring
 * 
 * @param {object} body - Request body to check
 * @returns {object} Report of findings
 */
export function checkXSSThreats(body) {
  if (!body || typeof body !== "object") {
    return { hasThreat: false, threats: [] };
  }

  const threats = [];

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string" && detectXSSPatterns(value)) {
      threats.push({
        field: key,
        pattern: value.substring(0, 100), // First 100 chars
        threat: "potential_xss",
      });
    }
  }

  return {
    hasThreat: threats.length > 0,
    threats,
  };
}
