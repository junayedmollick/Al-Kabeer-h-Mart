import { api } from './api';
let loading;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!loading) loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); script.remove(); loading = null; reject(new Error('Could not load secure payment checkout. Please retry.')); };
    const timer = setTimeout(() => script.onerror(), 20000);
    document.head.appendChild(script);
  });
  return loading;
}
export async function payForOrder(order) {
  await loadCheckout();
  const payment = await api('/orders/' + order.id + '/payment/start', {method:'POST',body:{}});
  if (payment.order) return payment.order;
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key:payment.key, order_id:payment.gatewayOrderId, amount:payment.amount, currency:'INR',
      name:'Al-Kabeer H Mart', description:'Order ' + order.id,
      prefill:{name:order.customerName,contact:order.customerPhone},
      config:{display:{blocks:{chosen:{name:order.paymentMethod,instruments:[{method:order.paymentCode}]}},sequence:['block.chosen'],preferences:{show_default_blocks:false}}},
      theme:{color:'#0AAD38'},
      handler: async result => {
        try { resolve(await api('/orders/' + order.id + '/payment/verify', {method:'POST',body:result})); }
        catch(e) { reject(e); }
      },
      modal:{ondismiss:() => reject(new Error('Payment was not completed. Your order is saved; retry from My Orders.'))},
    });
    checkout.open();
  });
}
