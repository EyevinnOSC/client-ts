export class TokenExpiredError extends Error {
  constructor() {
    super('Service Access Token expired');
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
  }
}

export class InvalidName extends Error {
  constructor(name: string) {
    super(`Invalid name: ${name}. Only alphanumeric characters are allowed.`);
  }
}

export class InstanceReadyTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InstanceReadyTimeoutError';
  }
}
