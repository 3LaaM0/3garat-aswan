// التنقل بين الأقسام في لوحة التحكم
function switchSection(sectionId, element) {
  document.querySelectorAll('.section-content').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
  
  document.getElementById('sec-' + sectionId).classList.add('active');
  if (element) element.classList.add('active');

  // تحديث العنوان
  const titles = {
    home: "نظرة عامة على المتجر",
    products: "إدارة المنتجات",
    categories: "إدارة الفئات",
    orders: "إدارة الطلبات",
    customers: "قائمة العملاء",
    coupons: "إدارة الكوبونات",
    offers: "العروض والخصومات",
    reviews: "تقييمات العملاء",
    banners: "إدارة البانرات",
    analytics: "التحليلات والتقارير",
    settings: "إعدادات المتجر"
  };
  document.getElementById('sectionTitle').textContent = titles[sectionId] || "لوحة التحكم";
  
  if (sectionId === 'orders') renderAdminOrders();
  if (sectionId === 'products') renderAdminProducts();
}

// تبديل الدارك مود واللايت مود
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('themeIcon');
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    themeIcon.textContent = '🌙';
    localStorage.setItem('wt_theme', 'light');
  } else {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    themeIcon.textContent = '☀️';
    localStorage.setItem('wt_theme', 'dark');
  }
}

// تحميل الثفوظ عند الفتح
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('wt_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    document.getElementById('themeIcon').textContent = '🌙';
  }
  
  // تحديث الإحصائيات في الصفحة الرئيسية
  updateDashboardStats();
});

function updateDashboardStats() {
  const savedOrders = JSON.parse(localStorage.getItem('wt_store_orders') || '[]');
  document.getElementById('statTotalOrders').textContent = savedOrders.length;
  
  let totalRev = savedOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  document.getElementById('statTotalRevenue').textContent = totalRev + " ج.م";
  
  let pending = savedOrders.filter(o => o.status === "بانتظار التأكيد" || !o.status).length;
  document.getElementById('statPendingOrders').textContent = pending;
  
  if (typeof PRODUCTS !== 'undefined') {
    document.getElementById('statTotalProducts').textContent = PRODUCTS.length;
  }
}

// عرض الطلبات في جدول الأدمن
function renderAdminOrders() {
  const container = document.getElementById('adminOrdersTable');
  if (!container) return;

  const savedOrders = JSON.parse(localStorage.getItem('wt_store_orders') || '[]');
  if (savedOrders.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">لا توجد طلبات مسجلة حتى الآن.</p>`;
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>رقم الطلب</th>
          <th>اسم العميل</th>
          <th>الهاتف</th>
          <th>الإجمالي</th>
          <th>الحالة الحالية</th>
          <th>إجراءات التحديث</th>
        </tr>
      </thead>
      <tbody>
  `;

  savedOrders.forEach((order, index) => {
    html += `
      <tr>
        <td><b>${order.orderNumber}</b></td>
        <td>${order.name}</td>
        <td>${order.phone}</td>
        <td>${order.total} ج.م</td>
        <td><span style="color: #00ff66; font-weight: bold;">${order.status || 'بانتظار التأكيد'}</span></td>
        <td>
          <button class="action-btn btn-blue" onclick="updateOrderStatus(${index}, 'جاري التجهيز')">تجهيز</button>
          <button class="action-btn btn-blue" onclick="updateOrderStatus(${index}, 'في طريقها للتوصيل')">شحن</button>
          <button class="action-btn btn-green" onclick="updateOrderStatus(${index}, 'تم التسليم')">تسليم</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function updateOrderStatus(index, newStatus) {
  let savedOrders = JSON.parse(localStorage.getItem('wt_store_orders') || '[]');
  if (savedOrders[index]) {
    savedOrders[index].status = newStatus;
    localStorage.setItem('wt_store_orders', JSON.stringify(savedOrders));
    alert("تم تحديث حالة الطلب إلى: " + newStatus);
    renderAdminOrders();
    updateDashboardStats();
  }
}

// عرض المنتجات في لوحة التحكم
function renderAdminProducts() {
  const container = document.getElementById('productsTableContainer');
  if (!container || typeof PRODUCTS === 'undefined') return;

  let html = `
    <table>
      <thead>
        <tr>
          <th>الصورة</th>
          <th>اسم المنتج</th>
          <th>السعر</th>
          <th>السعر القديم</th>
        </tr>
      </thead>
      <tbody>
  `;

  PRODUCTS.forEach(p => {
    html += `
      <tr>
        <td><img src="${p.image}" width="40" height="40" style="border-radius: 5px; object-fit: cover;"></td>
        <td><b>${p.name}</b></td>
        <td>${p.price} ج.م</td>
        <td>${p.oldPrice} ج.م</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}
// لا تقم بتشغيل أكواد الأدمن إلا إذا كنا في صفحة admin.html
if (window.location.pathname.includes('admin.html')) {
  // باقي كود الأدمن هنا كله...
}
