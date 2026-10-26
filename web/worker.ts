import { onRequestPost } from './functions/api/lead';
import { onRequestGet } from './functions/index';
import { sheetsEnabled, type SheetsEnv } from './functions/_lib/sheets';

type Env = SheetsEnv & { ASSETS: { fetch: (request: Request) => Promise<Response> } };

/** Worker entry: language redirect, lead API, then prerendered HTML. */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === '/' || path === '') return onRequestGet({ request });
    if (path === '/api/lead' || path === '/api/lead/') {
      if (request.method === 'GET') {
        return new Response(
          JSON.stringify({
            sheets: sheetsEnabled(env),
            hasSheetId: Boolean(env.GOOGLE_SHEET_ID),
            hasSaJson: Boolean(env.GOOGLE_SA_JSON),
            hasEmail: Boolean(env.GOOGLE_CLIENT_EMAIL),
            hasKey: Boolean(env.GOOGLE_PRIVATE_KEY),
          }),
          { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } },
        );
      }
      if (request.method !== 'POST') return new Response(null, { status: 405, headers: { allow: 'POST' } });
      return onRequestPost({ request, env });
    }
    return env.ASSETS.fetch(request);
  },
};
