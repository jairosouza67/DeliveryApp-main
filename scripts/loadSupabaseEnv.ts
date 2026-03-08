import fs from "node:fs";
import path from "node:path";

type SupabaseConfig = {
  url: string;
  publishableKey?: string;
  serviceRoleKey?: string;
};

function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};

  return fs.readFileSync(filePath, "utf8").split(/\r?\n/).reduce<Record<string, string>>((accumulator, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return accumulator;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return accumulator;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    accumulator[key] = value;
    return accumulator;
  }, {});
}

export function loadSupabaseEnv(): SupabaseConfig {
  const cwd = process.cwd();
  const merged = [
    ".env",
    ".env.local",
    ".env.development",
    ".env.development.local",
  ].reduce<Record<string, string>>((accumulator, fileName) => {
    return {
      ...accumulator,
      ...parseEnvFile(path.resolve(cwd, fileName)),
    };
  }, {});

  const url = process.env.SUPABASE_URL
    ?? process.env.VITE_SUPABASE_URL
    ?? merged.SUPABASE_URL
    ?? merged.VITE_SUPABASE_URL;

  const publishableKey = process.env.SUPABASE_ANON_KEY
    ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    ?? merged.SUPABASE_ANON_KEY
    ?? merged.VITE_SUPABASE_PUBLISHABLE_KEY;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    ?? merged.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Configuração do Supabase não encontrada. Defina SUPABASE_URL ou VITE_SUPABASE_URL no ambiente/.env.");
  }

  return { url, publishableKey, serviceRoleKey };
}