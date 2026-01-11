type CacheEnvelope<T> = {
  v: number;
  t: number; // epoch ms
  d: T;
};

export type CacheReadResult<T> = {
  data: T;
  storedAt: number;
  isStale: boolean;
};

export type CacheOptions = {
  key: string;
  ttlMs: number;
  version?: number;
};

const DEFAULT_VERSION = 1;

export function readCache<T>(options: CacheOptions): CacheReadResult<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(options.key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    const version = options.version ?? DEFAULT_VERSION;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.v !== version) return null;
    if (typeof parsed.t !== "number") return null;

    const age = Date.now() - parsed.t;
    return {
      data: parsed.d,
      storedAt: parsed.t,
      isStale: age > options.ttlMs,
    };
  } catch {
    return null;
  }
}

export function writeCache<T>(options: CacheOptions, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const version = options.version ?? DEFAULT_VERSION;
    const envelope: CacheEnvelope<T> = { v: version, t: Date.now(), d: data };
    window.localStorage.setItem(options.key, JSON.stringify(envelope));
  } catch {
    // ignore quota/serialization errors
  }
}

export function removeCache(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
