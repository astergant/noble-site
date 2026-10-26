/**
 * Cloudflare Git deploy: publish the Worker, then copy Google secrets from
 * *build* env into *runtime* secrets (dashboard Build vars never reach POST /api/lead).
 */
import { spawnSync } from 'node:child_process';

function run(cmd, args, input) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: input != null ? ['pipe', 'inherit', 'inherit'] : 'inherit',
    input: input ?? undefined,
  });
  if (r.status) process.exit(r.status);
}

run('npx', ['wrangler', 'deploy']);

const secrets = {
  GOOGLE_SA_JSON: process.env.GOOGLE_SA_JSON,
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
};

for (const [name, value] of Object.entries(secrets)) {
  if (!value?.trim()) continue;
  console.log(`cf-deploy: putting runtime secret ${name} (${value.length} chars)`);
  run('npx', ['wrangler', 'secret', 'put', name], value);
}
