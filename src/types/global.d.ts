export {};

declare global {
  interface Error {
    code?: string;
    status?: number;
    body?: unknown;
    portOwner?: { pid: number; name: string };
    retryable?: boolean;
    data?: unknown;
  }

  const EdgeRuntime: string | undefined;
}
