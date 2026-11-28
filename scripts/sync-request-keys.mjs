// Regenerates __tests__/request-keys.json from the backend's OpenAPI document:
//   node scripts/sync-request-keys.mjs ../family-tracker/docs/openapi.json
// The backend validates with forbidNonWhitelisted, so every key the app sends must appear there.
import fs from 'node:fs';

const source = process.argv[2];
if (!source) throw new Error('usage: node scripts/sync-request-keys.mjs <openapi.json>');
const doc = JSON.parse(fs.readFileSync(source, 'utf8'));
const schemas = doc.components?.schemas ?? {};
const resolve = (s) => (s?.$ref ? schemas[s.$ref.split('/').pop()] : s);

const routes = {};
for (const [path, methods] of Object.entries(doc.paths)) {
  for (const [method, op] of Object.entries(methods)) {
    const body = resolve(op.requestBody?.content?.['application/json']?.schema);
    const query = (op.parameters ?? [])
      .filter((p) => p.in === 'query')
      .map((p) => p.name)
      .sort();
    routes[`${method.toUpperCase()} ${path}`] = {
      body: body
        ? { allowed: Object.keys(body.properties ?? {}).sort(), required: [...(body.required ?? [])].sort() }
        : null,
      query,
    };
  }
}
// Bodies the document lacks or lists as empty. Taken from the source:
// RegisterPushTokenDto (notifications.controller.ts), CreatePaymentIntentDto (payments.controller.ts).
// POST /auth/refresh (bearer only, no body) and POST /auth/google exist in the source but not yet in the document.
const undocumented = {
  'POST /auth/refresh': { allowed: [], required: [], bodyless: true },
  'POST /auth/google': { allowed: ['idToken'], required: ['idToken'] },
  'POST /notifications/register': { allowed: ['token'], required: ['token'] },
  'POST /payments/create-payment-intent': { allowed: ['amount', 'currency'], required: ['amount', 'currency'] },
};
for (const [key, body] of Object.entries(undocumented)) {
  if (body.bodyless) routes[key] ??= { body: null, query: [] };
  else if (!routes[key] || (routes[key].body && routes[key].body.allowed.length === 0))
    routes[key] = { body, query: [] };
}

fs.writeFileSync(new URL('../__tests__/request-keys.json', import.meta.url), JSON.stringify(routes, null, 2) + '\n');
process.stdout.write(`wrote ${Object.keys(routes).length} routes\n`);
