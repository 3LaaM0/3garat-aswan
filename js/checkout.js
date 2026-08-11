// ============================================
// الطلبات (localStorage) + إرسال واتساب
// ============================================
const Orders = {
  KEY: "wtstore_orders",

  getAll() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  save(order) {
    const orders = this.getAll();
    orders.push(order);
    localStorage.setItem(this.KEY, JSON.stringify(orders));
  },

  findByNumberAndPhone(orderNumber, phone) {
    const orders = this.getAll();
    return orders.find(
      o => o.orderNumber.trim() === orderNumber.trim() && o.phone.trim() === phone.trim()
    );
  },

  generateOrderNumber() {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 89999);
    return `QR-${year}-${rand}`;
  },

  // نقطة اتصال جاهزة لإرسال الطلب لأتمتة خارجية (n8n / Make / Zapier / Webhook)
  // استبدل الدالة دي بطلب fetch حقيقي لما يبقى عندك endpoint
  sendToAutomation(order) {
    // مثال جاهز للاستخدام لاحقاً:
    // fetch("YOUR_WEBHOOK_URL", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(order)
    // });
    console.log("Order ready for automation webhook:", order);
  }
};

function buildWhatsAppMessage(order) {
  const productsList = order.items
    .map(i => `- ${i.name} × ${i.qty} = ${i.price * i.qty} ${STORE_CONFIG.currency}`)
    .join("\n");

  const message =
`طلب جديد من ${STORE_CONFIG.storeName} 🛍️

رقم الطلب: ${order.orderNumber}
الاسم: ${order.name}
الهاتف: ${order.phone}
واتساب: ${order.whatsapp}
المحافظة: ${order.province}
المدينة: ${order.city}
العنوان: ${order.address}
${order.notes ? `ملاحظات: ${order.notes}` : ""}

المنتجات:
${productsList}

الإجمالي: ${order.total} ${STORE_CONFIG.currency}
حالة الطلب: ${order.status}`;

  return encodeURIComponent(message);
}

function openWhatsAppOrder(order) {
  const text = buildWhatsAppMessage(order);
  const url = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${text}`;
  window.open(url, "_blank");
}
