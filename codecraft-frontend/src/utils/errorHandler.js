/**
 * Error Utility - Parse and format backend errors
 */

export const parseError = (error) => {
  // Network or timeout error
  if (!error.response) {
    return {
      status: 0,
      title: 'Connection Error',
      message: error.message || 'Unable to connect to the server. Please check your internet connection.',
    };
  }

  const status = error.response.status;
  const data = error.response.data;
  let message = data?.message || data?.error || '';

  // Parse specific error scenarios
  const errorMap = {
    400: {
      'email already exists': 'This email is already registered. Please use a different email or log in.',
      'invalid secret key': 'The admin secret key is invalid. Please check and try again.',
      'password too weak': 'Password must be at least 8 characters with uppercase, numbers, and special characters.',
      'invalid email format': 'Please enter a valid email address.',
      'missing required fields': 'Please fill in all required fields.',
    },
    401: {
      'invalid credentials': 'Invalid email or password. Please try again.',
      'token expired': 'Your session has expired. Please log in again.',
      'invalid token': 'Your session is invalid. Please log in again.',
    },
    403: {
      'forbidden': 'You do not have permission to access this resource.',
      'admin only': 'Only administrators can access this resource.',
      'invalid secret key': 'The admin secret key is incorrect.',
    },
    409: {
      'email already taken': 'This email is already registered. Please use a different email or log in.',
      'duplicate entry': 'This data already exists. Please use a different value.',
    },
  };

  // Try to find a matching error message
  const lowerMessage = message.toLowerCase();
  if (errorMap[status]) {
    for (const [key, value] of Object.entries(errorMap[status])) {
      if (lowerMessage.includes(key)) {
        message = value;
        break;
      }
    }
  }

  // Status code specific defaults
  const statusDefaults = {
    400: 'Invalid input. Please check your information and try again.',
    401: 'Your credentials are invalid. Please try again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This resource already exists. Please try a different value.',
    422: 'Please check your input and try again.',
    500: 'The server encountered an error. Please try again later.',
    502: 'The server is temporarily unavailable. Please try again later.',
    503: 'The service is temporarily unavailable. Please try again later.',
  };

  // Use mapped message or default
  if (!message) {
    message = statusDefaults[status] || 'An unexpected error occurred. Please try again.';
  }

  return {
    status,
    title: getTitleForStatus(status),
    message,
  };
};

/**
 * Get user-friendly title for HTTP status code
 */
const getTitleForStatus = (status) => {
  const titles = {
    400: 'Invalid Input',
    401: 'Authentication Failed',
    403: 'Access Denied',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Validation Error',
    500: 'Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return titles[status] || 'Error';
};

/**
 * Format error for display
 */
export const formatErrorForDisplay = (error) => {
  if (!error) return null;
  return parseError(error);
};

export default {
  parseError,
  formatErrorForDisplay,
};
