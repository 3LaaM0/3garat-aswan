// ============================================
// لوحة التحكم الإدارية المخفية (ملف مستقل وآمن)
// ============================================

// إضافة قسم اللوحة تلقائياً للصفحة عند التحميل
document.addEventListener("DOMContentLoaded", () => {
  const mainEl = document.querySelector("main");
  if (mainEl && !document.getElementById("view-admin")) {
    const adminDiv = document.createElement("div");
    adminDiv.className = "view";
    adminDiv.id = "view-admin";
    mainEl.appendChild(adminDiv);
  }
});

// دالة عرض الطلبات في اللوحة
function renderAdminPanel() {
  const el = document.getElementById("view-admin");
  if (!el) return;
  
  const savedOrders = JSON.parse(localStorage.getItem('wt_store_orders') || '[]');

  let rows = "";
  if (savedOrders.length === 0) {
    rows = `<tr><td colspan="4" style="padding:20px; text-align:center;">لا توجد طلبات حتى الآن</td></tr>`;
  } else {
    rows = savedOrders.map((o, index) => `
      <tr style="border-bottom: 1px solid #333;">
        <td style="padding: 12px;">${o.orderNumber}</td>
        <td style="padding: 12px;">${o.name}</td>
        <td style="padding: 12px; color: #00ff66; font-weight: bold;">${o.status || 'بانتظار التأكيد'}</td>
        <td style="padding: 12px;">
          <button class="btn" style="padding: 5px 10px; font-size: 12px; background: #ffaa00; color: #000; border:none; border-radius:4px; cursor:pointer;" onclick="updateOrderStatus(${index}, 'جاري التجهيز')">تجهيز</button>
          <button class="btn" style="padding: 5px 10px; font-size: 12px; background: #00aaff; color: #fff; border:none; border-radius:4px; cursor:pointer;" onclick="updateOrderStatus(${index}, 'في طريقها للتوصيل')">شحن</button>
          <button class="btn" style="padding: 5px 10px; font-size: 12px; background: #00ff66; color: #000; border:none; border-radius:4px; cursor:pointer;" onclick="updateOrderStatus(${index}, 'تم التسليم')">تسليم</button>
        </td>
      </tr>
    `).join("");
  }

  el.innerHTML = `
    <div class="container" style="padding: 40px 20px; color: #fff;">
      <h1 style="margin-bottom: 20px; font-size: 24px;">لوحة تحكم المتجر (الطلبات)</h1>
      <div style="background: #111; padding: 20px; border-radius: 8px; overflow-x: auto; border: 1px solid #222;">
        <table style="width:100%; border-collapse: collapse; text-align: right;">
          <thead>
            <tr style="background: #222; border-bottom: 2px solid #444;">
              <th style="padding: 12px;">رقم الطلب</th>
              <th style="padding: 12px;">اسم العميل</th>
              <th style="padding: 12px;">الحالة الحالية</th>
              <th style="padding: 12px;">تغيير الحالة</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function updateOrderStatus(index, newStatus) {
  let savedOrders = JSON.parse(localStorage.getItem('wt_store_orders') || '[]');
  if (savedOrders[index]) {
    savedOrders[index].status = newStatus;
    localStorage.setItem('wt_store_orders', JSON.stringify(savedOrders));
    showToast("تم تحديث حالة الطلب إلى: " + newStatus);
    renderAdminPanel();
  }
}

// تعديل بسيط لدعم فتح صفحة الـ admin عبر الـ hash
const originalRenderView = window.renderView;
if (typeof originalRenderView === 'function') {
  window.renderView = function(view, params) {
    if (view === "admin") {
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      let adminEl = document.getElementById("view-admin");
      if (adminEl) {
        adminEl.classList.add("active");
        renderAdminPanel();
      }
    } else {
      originalRenderView(view, params);
    }
  };
}
