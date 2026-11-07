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

export class PasswordRequired extends Error {
  constructor(serviceId: string) {
    super(
      `A Password is required to create a ${serviceId} instance. ` +
        `Supply a Password parameter or a {{secrets.<name>}} reference.`
    );
    this.name = 'PasswordRequired';
  }
}
