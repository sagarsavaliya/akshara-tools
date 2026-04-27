import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import dotenv from 'dotenv'
import { createClient } from '@libsql/client'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const migrationsDirectory = path.resolve(__dirname, '../db/migrations')

export function sortMigrationFilenames(filenames) {
  return [...filenames].filter((name) => name.endsWith('.sql')).sort((a, b) => a.localeCompare(b))
}

export function resolveDbEnv(env = process.env) {
  const url = (env.TURSO_DATABASE_URL ?? env.VITE_TURSO_DATABASE_URL ?? '').trim()
  const authToken = (env.TURSO_AUTH_TOKEN ?? env.VITE_TURSO_AUTH_TOKEN ?? '').trim()

  if (!url) {
    throw new Error(
      'Missing database URL. Set TURSO_DATABASE_URL (or VITE_TURSO_DATABASE_URL for local testing).',
    )
  }

  return { url, authToken }
}

async function ensureMigrationsTable(client) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

async function getAppliedMigrations(client) {
  const result = await client.execute('SELECT filename FROM _migrations ORDER BY filename ASC;')
  return new Set(result.rows.map((row) => String(row.filename)))
}

/**
 * libsql `execute()` accepts one SQL statement per call.
 * Migration files may contain several statements separated by `;`.
 */
export function splitSqlStatements(sql) {
  return sql
    .replace(/\r\n/g, '\n')
    .split(';')
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)
}

async function runMigrationFile(client, filename) {
  const fullPath = path.resolve(migrationsDirectory, filename)
  const sql = (await readFile(fullPath, 'utf8')).trim()
  if (!sql) return

  const statements = splitSqlStatements(sql)
  for (const statement of statements) {
    await client.execute(statement)
  }
  await client.execute({
    sql: 'INSERT INTO _migrations (filename) VALUES (?);',
    args: [filename],
  })
}

export async function runMigrations() {
  const { url, authToken } = resolveDbEnv()
  const client = createClient({ url, authToken })

  try {
    await ensureMigrationsTable(client)

    const files = sortMigrationFilenames(await readdir(migrationsDirectory))
    const appliedMigrations = await getAppliedMigrations(client)
    let appliedCount = 0

    for (const filename of files) {
      if (appliedMigrations.has(filename)) {
        console.log(`Skipping already applied migration: ${filename}`)
        continue
      }

      await runMigrationFile(client, filename)
      appliedCount += 1
      console.log(`Applied migration: ${filename}`)
    }

    console.log(`Migration complete. Applied ${appliedCount} migration(s).`)
  } finally {
    client.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runMigrations().catch((error) => {
    console.error(`Migration failed: ${error.message}`)
    process.exitCode = 1
  })
}
