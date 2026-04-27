import { createClient } from '@libsql/client'

export function createLibsqlClientFromEnv(env = import.meta.env) {
  const url = env.VITE_TURSO_DATABASE_URL
  const authToken = env.VITE_TURSO_AUTH_TOKEN

  if (!url) {
    throw new Error(
      'Missing VITE_TURSO_DATABASE_URL. Add it to your .env file before creating a libsql client.',
    )
  }

  return createClient({ url, authToken })
}
