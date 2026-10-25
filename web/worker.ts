import { onRequestPost } from './functions/api/lead';
import { onRequestGet } from './functions/index';
import type { SheetsEnv } from './functions/_lib/sheets';

type Env = SheetsEnv & { ASSETS: { fetch: (request: Request) => Promise<Response> } };

/** Worker entry: language redirect, lead API, then prerendered HTML. */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === '/' || path === '') return onRequestGet({ request });
    if (path === '/api/lead' || path === '/api/lead/') {
      if (request.method !== 'POST') return new Response(null, { status: 405, headers: { allow: 'POST' } });
      return onRequestPost({ request, env });
    }
    return env.ASSETS.fetch(request);
  },
};
