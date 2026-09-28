/**
 * Role-based regression checks for Final Release (Backend).
 * Usage: node src/scripts/regression.js
 * Requires: server running + seeded data
 */
require('dotenv').config();

const BASE = process.env.API_BASE || 'http://localhost:5000/api';

async function req(method, path, body, token, expectStatus) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (expectStatus && res.status !== expectStatus) {
    throw new Error(`${method} ${path} expected ${expectStatus} got ${res.status}: ${JSON.stringify(json)}`);
  }
  if (!expectStatus && (!res.ok || json.success === false)) {
    throw new Error(`${method} ${path} => ${JSON.stringify(json)}`);
  }
  return { status: res.status, json };
}

function pass(name) {
  console.log(`  ✓ ${name}`);
}

async function main() {
  console.log('=== ReGive Backend Regression (Phase 5) ===\n');

  const health = await req('GET', '/health');
  if (health.json.data.phase !== 'final-release') {
    throw new Error('health.phase should be final-release');
  }
  pass('health phase=final-release');

  const ready = await req('GET', '/ready');
  if (!ready.json.success) throw new Error('ready check failed');
  pass('ready mongo connected');

  const user = (await req('POST', '/auth/login', { email: 'user@regive.local', password: 'User@123' })).json.data;
  const emp = (await req('POST', '/auth/login', { email: 'employee@regive.local', password: 'Employee@123' })).json.data;
  const admin = (await req('POST', '/auth/login', { email: 'admin@regive.local', password: 'Admin@123' })).json.data;
  const ben = (await req('POST', '/auth/login', { email: 'beneficiary@regive.local', password: 'Beneficiary@123' })).json.data;
  pass('login all 4 roles');

  // RBAC negatives
  await req('GET', '/auth/users', null, user.token, 403);
  pass('USER cannot list users');
  await req('GET', '/reports/overview', null, user.token, 403);
  pass('USER cannot view reports');
  await req('GET', '/inventory/summary', null, ben.token, 403);
  pass('BENEFICIARY cannot view inventory');
  await req('POST', '/ai/assess-product', { productId: '000000000000000000000000' }, user.token, 403);
  pass('USER cannot call AI assess');

  // Public / user flows
  const campaigns = (await req('GET', '/campaigns')).json.data;
  if (!campaigns.campaigns?.length) throw new Error('no campaigns');
  pass('public campaigns list');

  const market = (await req('GET', '/products/marketplace')).json.data;
  pass(`marketplace products=${market.products?.length || 0}`);

  await req('GET', '/donations/me', null, user.token);
  await req('GET', '/volunteers/me', null, user.token);
  await req('GET', '/orders/me', null, user.token);
  await req('GET', '/notifications', null, user.token);
  pass('USER me-endpoints');

  await req('GET', '/support-requests/me', null, ben.token);
  pass('BENEFICIARY support me');

  // Staff flows
  await req('GET', '/products', null, emp.token);
  await req('GET', '/inventory/summary', null, emp.token);
  await req('GET', '/orders', null, emp.token);
  await req('GET', '/ai/pending', null, emp.token);
  await req('GET', '/reports/overview', null, emp.token);
  pass('EMPLOYEE ops endpoints');

  await req('GET', '/auth/users', null, admin.token);
  await req('GET', '/campaigns/manage/all', null, admin.token);
  pass('ADMIN management endpoints');

  // Payment token not leaked in list
  const pays = (await req('GET', '/payments/me', null, user.token)).json.data;
  if (pays.payments?.some((p) => p.sandboxToken)) {
    throw new Error('sandboxToken leaked in /payments/me');
  }
  pass('payment list hides sandboxToken');

  console.log('\nREGRESSION_OK');
}

main().catch((err) => {
  console.error('\nREGRESSION_FAIL', err.message);
  process.exit(1);
});
