export function orderWhatsAppUrl(order, phone, storeName = 'Al Kabeer H Mart') {
  let number = String(order.storeWhatsapp || phone || '').replace(/\D/g, '');
  if (number.length === 10) number = '91' + number;
  if (!/^[1-9]\d{9,14}$/.test(number)) return '';
  const amount = value => Number(value || 0).toFixed(2);
  const clean = value => String(value || '').replace(/[*_~`]/g, '').trim();
  const placed = new Date(order.createdAt);
  const date = Number.isNaN(placed.getTime()) ? '' : new Intl.DateTimeFormat('en-IN', {dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'}).format(placed) + ' IST';
  const quantity = order.items.reduce((sum,item) => sum + item.quantity,0);
  const message = [
    `🛒 *${clean(order.storeName || storeName).toUpperCase()}*`,
    '*ORDER CONFIRMATION REQUEST*', '',
    `*Order number:* ${clean(order.id)}`, ...(date ? [`*Placed:* ${date}`] : []),
    `*Order status:* ${clean(order.status)}`, '',
    '━━━━━━━━━━━━━━━━━━━━', '👤 *CUSTOMER*',
    `*Name:* ${clean(order.customerName)}`, `*Phone:* ${clean(order.customerPhone)}`, '',
    '📍 *DELIVERY ADDRESS*', clean(order.deliveryAddress), `*PIN code:* ${clean(order.pincode)}`, '',
    '━━━━━━━━━━━━━━━━━━━━', `🧺 *ORDER ITEMS · ${quantity} ${quantity===1?'unit':'units'}*`, '',
    ...order.items.flatMap((item,index) => [
      `*${index + 1}. ${clean(item.name)}*`,
      ...(item.weight ? [`Pack: ${clean(item.weight)}`] : []),
      `${item.quantity} × ₹${amount(item.price)} = *₹${amount(item.price * item.quantity)}*`, '',
    ]),
    '━━━━━━━━━━━━━━━━━━━━', '💰 *BILL SUMMARY*',
    `Items subtotal: ₹${amount(order.subtotal)}`,
    `Discount${order.couponCode ? ` (${clean(order.couponCode)})` : ''}: −₹${amount(order.discount)}`,
    `Delivery fee: ${order.deliveryFee===0?'FREE':'₹'+amount(order.deliveryFee)}`,
    `*GRAND TOTAL: ₹${amount(order.total)}*`, '',
    '💳 *PAYMENT*', `*Selected method:* ${clean(order.paymentMethod)}`,
    `*Payment status:* ${clean(order.paymentStatus)}`,
    ...(order.paymentMode === 'preference' ? ['Payment preference only — no payment collected on the website.'] : []),
    ...(['Unpaid','Pending','Not paid'].includes(order.paymentStatus) ? ['Payment has not been confirmed.'] : []), '',
    'Please confirm item availability and the expected delivery time.',
    'Thank you! 🙏',
  ].join('\n');
  return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
}
