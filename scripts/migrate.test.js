import { describe, expect, it } from 'vitest'
import { resolveDbEnv, sortMigrationFilenames, splitSqlStatements } from './migrate.mjs'

describe('sortMigrationFilenames', () => {
  it('sorts SQL files and ignores non-SQL files', () => {
    const files = ['notes.txt', '0002_b.sql', '0001_a.sql']

    expect(sortMigrationFilenames(files)).toEqual(['0001_a.sql', '0002_b.sql'])
  })
})

describe('splitSqlStatements', () => {
  it('splits multiple statements for libsql execute()', () => {
    const sql = `CREATE INDEX a ON t (x);
CREATE INDEX b ON t (y);`

    expect(splitSqlStatements(sql)).toEqual([
      'CREATE INDEX a ON t (x)',
      'CREATE INDEX b ON t (y)',
    ])
  })

  it('keeps a single CREATE VIEW as one statement when no inner semicolons', () => {
    const sql = `CREATE VIEW v AS SELECT 1 AS n;`

    expect(splitSqlStatements(sql)).toEqual(['CREATE VIEW v AS SELECT 1 AS n'])
  })
})

describe('resolveDbEnv', () => {
  it('prefers Turso-prefixed variables', () => {
    const env = {
      TURSO_DATABASE_URL: 'libsql://primary-db.turso.io',
      TURSO_AUTH_TOKEN: 'top-secret-token',
      VITE_TURSO_DATABASE_URL: 'libsql://fallback-db.turso.io',
      VITE_TURSO_AUTH_TOKEN: 'fallback-token',
    }

    expect(resolveDbEnv(env)).toEqual({
      url: 'libsql://primary-db.turso.io',
      authToken: 'top-secret-token',
    })
  })

  it('throws a clear error when URL is missing', () => {
    expect(() => resolveDbEnv({})).toThrow(/Missing database URL/)
  })
})
