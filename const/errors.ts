export interface IAppError {
  CODE: number;
  MESSAGE: string;
}

interface IErrors {
  [key: string]: {
    [key: string]: IAppError
  }
}

export const ERRORS: IErrors = {
  AUTH: {
    ALREADY_LOGGED_IN: {
      CODE: 4002,
      MESSAGE: `Log out before signing up.`
    },
    USER_NOT_FOUND: {
      CODE: 4003,
      MESSAGE: `User not found.`
    },
    USER_IS_DISABLED: {
      CODE: 4004,
      MESSAGE: `User is disabled.`
    },
    WRONG_PASSWORD: {
      CODE: 4005,
      MESSAGE: `Incorrect password.`
    },
    NO_SUCH_LOGIN_SESSION: {
      CODE: 4006,
      MESSAGE: `A specified logIn session does not exist.`
    },
    PERMISSION_DENIED: {
      CODE: 4007,
      MESSAGE: `Forbidden. (Request sign doesn't match)`
    },
    PERMISSION_FOR_ADMIN_ONLY: {
      CODE: 4007,
      MESSAGE: `Only admin can access this route!`
    },
    PERMISSION_DENIED_FOR_THIS_IP: {
      CODE: 4011,
      MESSAGE: `This IP cannot access this route!`
    },
    HASH_INVALID: {
      CODE: 4012,
      MESSAGE: `Invalid hash!`
    },
    HASH_NOT_EXISTS: {
      CODE: 4013,
      MESSAGE: `Hash does not exist!`
    },
    ACCESS_DENIED: {
      CODE: 4014,
      MESSAGE: `Access denied!`
    },
    ACCESS_DENIED_ROLE: {
      CODE: 4015,
      MESSAGE: `Unsupported role!`
    }
  },
  COMMON: {
    REQUEST_VALIDATION: {
      CODE: 3000,
      MESSAGE: `Request validation failed: validationMessage.`
    },
    SYNTAX_ERROR: {
      CODE: 5000,
      MESSAGE: `SyntaxError.`
    },
    NOT_FOUND: {
      CODE: 5001,
      MESSAGE: `Not found.`
    },
    UNKNOWN: {
      CODE: 5002,
      MESSAGE: `Unknown error in api.`
    }
  }
};
