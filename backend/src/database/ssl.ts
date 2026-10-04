// Supabase (and most hosted Postgres) requires TLS; the local docker Postgres does not.
// Enabled automatically for *.supabase.com/.co hosts, or explicitly with DB_SSL=true.
export function resolveDatabaseSsl(
  url: string | undefined,
  dbSsl: string | undefined,
): { rejectUnauthorized: boolean } | false {
  if (dbSsl === 'false') return false;
  if (dbSsl === 'true' || /supabase\.(com|co)/.test(url ?? '')) {
    return { rejectUnauthorized: false };
  }
  return false;
}
