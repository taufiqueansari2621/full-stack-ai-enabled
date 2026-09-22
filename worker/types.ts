export interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success: boolean;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface Env {
  DB: D1Database;
  ASSETS: { fetch(request: Request): Promise<Response> };
  ENVIRONMENT?: string;
  REGISTRATION_MODE?: string;
  AI: {
    run(
      model: string,
      input: Record<string, unknown>,
      options?: Record<string, unknown>,
    ): Promise<unknown>;
  };
}

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  username: string;
};
