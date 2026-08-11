// ============================================
// تتبع الطلب
// ============================================
const ORDER_STATUSES = [
  "تم استلام الطلب",
  "بانتظار التأكيد",
  "تم تأكيد الطلب",
  "جاري تجهيز الطلب",
  "تم شحن الطلب",
  "تم تسليم الطلب"
];

function renderTrackingResult(order) {
  const container = document.getElementById("trackingResult");
  if (!order) {
    container.innerHTML = `
      <div class="empty-state fade-in">
        <div class="empty-icon">❌</div>
        <p>لم يتم العثور على طلب بهذا الرقم ورقم الهاتف</p>
      </div>`;
    container.style.display = "block";
    return;
  }

  const currentIndex = ORDER_STATUSES.indexOf(order.status);

  const timelineHtml = ORDER_STATUSES.map((status, idx) => {
    const state = idx < currentIndex ? "done" : idx === currentIndex ? "current" : "pending";
    return `
      <div class="timeline-step ${state}">
        <div class="timeline-dot"></div>
        <div class="timeline-label">${status}</div>
      </div>`;
  }).join("");

  container.innerHTML = `
    <div class="tracking-card fade-in">
      <div class="tracking-header">
        <span class="order-number">${order.orderNumber}</span>
        <span class="order-date">${order.date}</span>
      </div>
      <div class="timeline">${timelineHtml}</div>
      <div class="tracking-summary">
        <p><strong>الاسم:</strong> ${order.name}</p>
        <p><strong>الإجمالي:</strong> ${order.total} ${STORE_CONFIG.currency}</p>
        <p><strong>الحالة الحالية:</strong> <span class="status-badge">${order.status}</span></p>
      </div>
    </div>`;
  container.style.display = "block";
}
