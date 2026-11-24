import { createHttpClient, type HttpClient, type HttpClientConfig } from './client';

let instance: HttpClient | null = null;

/** Called once at startup (see bootstrap/api.ts). Everything else uses `http`. */
export function configureHttp(config: HttpClientConfig): HttpClient {
  instance = createHttpClient(config);
  return instance;
}

const current = (): HttpClient => {
  if (!instance) throw new Error('HTTP client is not configured. Call configureHttp() at startup.');
  return instance;
};

/** The app-wide client. Feature api modules call this; screens never do. */
export const http: HttpClient = {
  request: (...args) => current().request(...args),
  get: (...args) => current().get(...args),
  post: (...args) => current().post(...args),
  put: (...args) => current().put(...args),
  delete: (...args) => current().delete(...args),
};
