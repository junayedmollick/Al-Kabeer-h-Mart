import { createHmac, timingSafeEqual } from 'node:crypto';

export function validSignature(value, signature, secret) {
  if (!secret || typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(value).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}

export function razorpayGateway(env = process.env) {
  const key = env.RAZORPAY_KEY_ID || '', secret = env.RAZORPAY_KEY_SECRET || '';
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || '';
  const enabled = !!(key && secret && webhookSecret);
  async function request(path, body) {
    if (!enabled) throw Object.assign(new Error('Online payments are not configured. Choose cash on delivery.'), {status:503});
    let response;
    try {
      response = await fetch('https://api.razorpay.com/v1/' + path, {
        method: body ? 'POST' : 'GET', signal: AbortSignal.timeout(15000),
        headers: {Authorization: 'Basic ' + Buffer.from(key + ':' + secret).toString('base64'), 'Content-Type':'application/json'},
        ...(body ? {body:JSON.stringify(body)} : {}),
      });
    } catch { throw Object.assign(new Error('Payment provider unavailable. Your saved order can be retried from My Orders.'), {status:502}); }
    if (!response.ok) throw Object.assign(new Error('The payment provider could not complete this request. Please retry later.'), {status:502});
    return response.json();
  }
  return {
    enabled, key, testMode:key.startsWith('rzp_test_'),
    createOrder: order => request('orders', {amount:Math.round(order.total * 100),currency:'INR',receipt:order.id}),
    fetchPayment: id => request('payments/' + encodeURIComponent(id)),
    verify: (orderId, paymentId, signature) => validSignature(orderId + '|' + paymentId, signature, secret),
    verifyWebhook: (raw, signature) => validSignature(raw, signature, webhookSecret),
  };
}
