/**
 * Better Auth schema setup helper.
 *
 * Better Auth manages its own tables via its CLI.
 * This script prints instructions and the SQL to run in DBeaver.
 *
 * Usage:
 *   npm run db:migrate:auth
 */
import * as path from 'path';
import * as fs   from 'fs';

const sqlFile = path.join(__dirname, 'better-auth-schema.sql');
const sql     = fs.readFileSync(sqlFile, 'utf8');

console.log('\n[YouthTrend] Better Auth Schema Setup');
console.log('══════════════════════════════════════\n');
console.log('Better Auth manages its own tables separately from your migrations.\n');
console.log('Option 1 — Run via Better Auth CLI:');
console.log('  npx @better-auth/cli migrate\n');
console.log('Option 2 — Run in DBeaver:');
console.log('  Open DBeaver → your youthtrend_dev database');
console.log('  Open SQL Editor → paste and run the following:\n');
console.log('─'.repeat(60));
console.log(sql);
console.log('─'.repeat(60));
console.log('\nFile also saved at: src/db/better-auth-schema.sql\n');