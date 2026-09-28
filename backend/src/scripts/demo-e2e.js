/**
 * End-to-end demo script covering Sprint 1–3 happy path (backend only).
 * Usage: node src/scripts/demo-e2e.js
 */
require('dotenv').config();

const BASE = process.env.API_BASE || 'http://localhost:5000/api';

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(`${method} ${path} => ${JSON.stringify(json)}`);
  }
  return json.data;
}

async function main() {
  const health = await req('GET', '/health');
  console.log('1) Health sprint=', health.sprint, 'phase=', health.phase, 'ai=', health.aiProvider);

  const emp = await req('POST', '/auth/login', {
    email: 'employee@regive.local',
    password: 'Employee@123',
  });
  const user = await req('POST', '/auth/login', {
    email: 'user@regive.local',
    password: 'User@123',
  });

  // Always create a fresh product for deterministic AI demo
  const campaigns = await req('GET', '/campaigns');
  const donation = await req(
    'POST',
    '/donations',
    {
      campaignId: campaigns.campaigns[0]._id,
      type: 'product',
      productInfo: {
        name: `E2E Áo khoác denim ${Date.now()}`,
        quantity: 1,
        description: 'Áo khoác jean còn tốt, like new, đã giặt sạch',
        conditionNote: 'like new',
      },
    },
    user.token
  );
  const intake = await req(
    'POST',
    '/products/intake',
    {
      donationId: donation.donation._id,
      category: 'clothing',
      images: ['https://example.com/demo-jacket.jpg'],
    },
    emp.token
  );
  const product = intake.product;
  console.log('2) Product for AI:', product.name, product._id);

  const ai = await req(
    'POST',
    '/ai/assess-product',
    {
      productId: product._id,
      extraNote: 'like new, cleaned, suitable for resale',
      images: product.images || ['https://example.com/demo-jacket.jpg'],
    },
    emp.token
  );
  console.log(
    '3) AI suggested:',
    ai.assessment.suggestion.condition,
    ai.assessment.suggestion.suggestedPrice,
    'status=',
    ai.assessment.status
  );

  // Human-in-the-loop: always confirm with safe marketplace values
  const confirmed = await req(
    'POST',
    `/ai/assessments/${ai.assessment._id}/confirm`,
    {
      condition: 'like_new',
      quality: 'high',
      category: 'clothing',
      suggestedPrice: Math.max(ai.assessment.suggestion.suggestedPrice || 0, 80000),
      price: Math.max(ai.assessment.suggestion.suggestedPrice || 0, 80000),
      suitableForMarketplace: true,
      assessmentNote: 'Human confirmed/overrode AI for E2E demo',
    },
    emp.token
  );
  console.log(
    '4) Human review:',
    confirmed.assessment.status,
    'productStatus=',
    confirmed.product.status,
    'listed=',
    confirmed.product.listedOnMarketplace
  );

  if (confirmed.product.stockQuantity < 1) {
    await req(
      'POST',
      '/inventory/stock-in',
      {
        productId: confirmed.product._id,
        quantity: 2,
        storageLocation: 'Kệ AI-1',
        reason: 'E2E stock in after AI',
      },
      emp.token
    );
  }

  const published = await req(
    'POST',
    `/products/${confirmed.product._id}/publish`,
    {},
    emp.token
  );
  console.log('5) Published:', published.product.listedOnMarketplace);

  const order = await req(
    'POST',
    '/orders',
    { productId: published.product._id, quantity: 1 },
    user.token
  );
  const payment = await req(
    'POST',
    '/payments',
    { purpose: 'order', orderId: order.order._id },
    user.token
  );
  await req(
    'POST',
    '/payments/sandbox/confirm',
    {
      paymentId: payment.payment.id,
      sandboxToken: payment.payment.sandboxToken,
    },
    user.token
  );
  const myOrders = await req('GET', '/orders/me', null, user.token);
  console.log('6) Order after pay:', myOrders.orders[0].status);

  const report = await req('GET', '/reports/overview', null, emp.token);
  console.log('7) Report revenue:', report.summary.orderRevenue);
  console.log('E2E_SPRINT3_OK');
}

main().catch((err) => {
  console.error('E2E_FAIL', err.message);
  process.exit(1);
});
