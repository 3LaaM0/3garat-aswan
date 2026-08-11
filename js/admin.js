// ============================================
// لوحة التحكم الإدارية المخفية (معدلة ومضمونة)
// ============================================

window.addEventListener("hashchange", checkAdminRoute);
window.addEventListener("load", checkAdminRoute);

function checkAdminRoute() {
  if (window.location.hash.includes("admin")) {
    renderAdminPanelDirectly();
  }
}

function renderAdminPanelDirectly() {
  // إخفاء باقي الأقسام
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  
  // التأكد من وجود عنصر الـ admin أو إنشائه فوراً
  let adminEl = document.getElementById("view-admin");
  if (!adminEl) {
    adminEl = document.createElement("div");
    adminEl.className = "view active";
    adminEl.id = "view-admin";
    const main = document.querySelector("main");
    if (main) main.appendChild(adminEl);
  } else {
    adminEl.classList.add("active");
  }

  const savedOrders = JSON.parse(localStorage.getItem('wt_store_orders') || '[]');

  let rows = "";
  if (savedOrders.length === 0) {
    rows = `<tr><td colspan="4" style="padding:20px; text-align:center; color:#888;">لا توجد طلبات مخزنة محلياً حتى الآن</td></tr>`;
  } else {
    rows = savedOrders.map((o, index) => `
      <tr style="border-bottom: 1px solid #333;">
        <td style="padding: 12px; color:#fff;">${o.orderNumber}</td>
        <td style="padding: 12px; color:#fff;">${o.name || 'بدون اسم'}</td>
        <td style="padding: 12px; color: #00ff66; font-weight: bold;">${o.status || 'بانتظار التأكيد'}</td>
        <td style="padding: 12px;">
          <button style="padding: 6px 12px; margin-left: 5px; background: #ffaa00; color: #000; border:none; border-radius:4px; cursor:pointer; font-weight:bold;" onclick="updateAdminOrderStatus(${index}, 'جاري التجهيز')">تجهيز</button>
          <button style="padding: 6px 12px; margin-left: 5px; background: #00aaff; color: #fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;" onclick="updateAdminOrderStatus(${index}, 'في طريقها للتوصيل')">شحن</button>
          <button style="padding: 6px 12px; background: #00ff66; color: #000; border:none; border-radius:4px; cursor:pointer; font-weight:bold;" onclick="updateAdminOrderStatus(${index}, 'تم التسليم')">تسليم</button>
        </td>
      </tr>
    `).join("");
  }

  adminEl.innerHTML = `
    <div class="container" style="padding: 40px 20px;">
      <h1 style="margin-bottom: 20px; font-size: 26px; color: #fff; text-align: right;">لوحة تحكم المتجر (الطلبات)</h1>
      <div style="background: #111; padding: 20px; border-radius: 8px; overflow-x: auto; border: 1px solid #333;">
        <table style="width:100%; border-collapse: collapse; text-align: right;">
          <thead>
            <tr style="background: #222; border-bottom: 2px solid #444; color: #aaa;">
              <th style="padding: 12px;">رقم الطلب</th>
              <th style="padding: 12px;">اسم العميل</th>
              <th style="padding: 12px;">الحالة الحالية</th>
              <th style="padding: 12px;">إجراءات التحديث</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function updateAdminOrderStatus(index, newStatus) {
  let savedOrders = JSON.parse(localStorage.getItem('wt_store_orders') || '[]');
  if (savedOrders[index]) {
    savedOrders[index].status = newStatus;
    localStorage.setItem('wt_store_orders', JSON.stringify(savedOrders));
    alert("تم تحديث الحالة بنجاح إلى: " + newStatus);
    renderAdminPanelDirectly();
  }
}
