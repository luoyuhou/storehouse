const { env } = process;

export class Env {
  static get JWT_TOKEN_KEY(): string {
    return env.JWT_TOKEN_KEY!;
  }

  static get IS_PROD(): boolean {
    return env.NODE_ENV === "production";
  }

  static get IS_LOCAL() {
    return env.NODE_ENV === "development";
  }

  static get BACKEND_URL(): string {
    return env.BACKEND_URL!;
  }

  static get NEXT_PUBLIC_SHOW_LOGGER(): boolean {
    return env.NEXT_PUBLIC_SHOW_LOGGER === "true";
  }
}

export const showLogger = Env.IS_LOCAL || Env.NEXT_PUBLIC_SHOW_LOGGER;
