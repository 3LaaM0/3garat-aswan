// ============================================
// التطبيق الرئيسي - متجر WT Store الاحترافي (سحابي ومصحح)
// ============================================

const EGY_PHONE_REGEX = /^01[0125][0-9]{8}$/;

const EGYPT_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة",
  "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية",
  "الوادي الجديد", "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد",
  "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر",
  "قنا", "شمال سيناء", "سوهاج"
];

// حقن أنيميشن النقطة النابضة فقط (أنيميشن ظهور الصفحات معرّف بالفعل في style.css)
if (!document.getElementById("page-motion-styles")) {
  const style = document.createElement("style");
  style.id = "page-motion-styles";
  style.innerHTML = `
    @keyframes pulse-dot {
      0% { transform: scale(0.95); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.4; }
      100% { transform: scale(0.95); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

function navigate(view, params = {}) {
  closeMobileMenu();
  
  if (view === "products" || view === "productsGrid" || view === "productsSection") {
    scrollToSection("productsSection");
    return;
  }
  if (view === "about" || view === "aboutSection") {
    scrollToSection("aboutSection");
    return;
  }

  const hash = params.id ? `#${view}?id=${params.id}` : `#${view}`;
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  } else {
    renderView(view, params);
  }
}

function parseHash() {
  const hash = window.location.hash.replace("#", "") || "home";
  const [view, query] = hash.split("?");
  const params = {};
  if (query) {
    const usp = new URLSearchParams(query);
    if (usp.get("id")) params.id = parseInt(usp.get("id"), 10);
  }
  return { view: view || "home", params };
}

// دالة العرض بدقة ومنع النزول الخاطئ للأسفل
function renderView(view, params) {
  if (view === "products" || view === "productsSection") {
    scrollToSection("productsSection");
    return;
  }
  if (view === "about" || view === "aboutSection") {
    scrollToSection("aboutSection");
    return;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  const target = document.getElementById(`view-${view}`) || document.getElementById("view-home");

  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  target.classList.add("active");

  executeViewRender(view, params);
}

function executeViewRender(view, params) {
  if (view === "product") renderProductDetails(params.id);
  if (view === "cart") renderCartView();
  if (view === "checkout") renderCheckoutView();
  if (view === "myorders") renderMyOrdersView();
}

// ---------- جلب المنتجات المحدثة من LocalStorage أو الافتراضية ----------
function getActiveProducts() {
  const saved = localStorage.getItem('wt_custom_products');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
}

// ---------- عرض المنتجات بالرئيسية ----------
function renderProductGrid() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const productsList = getActiveProducts();

  if (!productsList || productsList.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 18px; padding: 60px 0;">لا توجد منتجات معروضة حالياً.</p>`;
    return;
  }

  grid.innerHTML = productsList.map(p => `
    <div class="product-card fade-in-up">
      <div class="product-image" onclick="navigate('product', {id: ${p.id}})" style="cursor: pointer;">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='assets/logo.jpg'">
      </div>
      <div class="product-body">
        <h3 class="product-name" onclick="navigate('product', {id: ${p.id}})" style="cursor: pointer;">${p.name}</h3>
        <p class="product-desc">${p.shortDesc || ''}</p>
        <div class="product-price-row">
          <span class="price">${p.price} ${STORE_CONFIG.currency}</span>
          <span class="old-price">${p.oldPrice ? p.oldPrice + ' ' + STORE_CONFIG.currency : ''}</span>
        </div>
        <div class="product-actions">
          <button class="btn btn-outline" onclick="navigate('product', {id: ${p.id}})">التفاصيل</button>
          <button class="btn btn-primary" onclick="quickAddToCart(${p.id}, event)">إضافة للسلة</button>
        </div>
      </div>
    </div>
  `).join("");
}

function quickAddToCart(id, e) {
  e.stopPropagation();
  Cart.add(id, 1);
  showToast("تمت إضافة المنتج إلى السلة بنجاح 🛍️");
}

// ---------- صفحة تفاصيل المنتج ----------
function renderProductDetails(id) {
  const productsList = getActiveProducts();
  const product = productsList.find(p => p.id === id) || productsList[0];
  const el = document.getElementById("view-product");
  if (!el || !product) return;

  const randomViewers = Math.floor(Math.random() * (125 - 45 + 1)) + 45;

  el.innerHTML = `
    <div class="container product-details">
      <button class="back-btn" onclick="navigate('home')">← العودة للمنتجات</button>
      <div class="details-grid">
        <div class="details-image">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/logo.jpg'">
        </div>
        <div class="details-info">
          <h1>${product.name}</h1>
          
          <div class="live-viewers" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(0, 255, 102, 0.1); color: #00ff66; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 10px; border: 1px solid rgba(0, 255, 102, 0.2);">
            <span style="width: 8px; height: 8px; background-color: #00ff66; border-radius: 50%; display: inline-block; animation: pulse-dot 1.5s infinite;"></span>
            🔥 الآن يُشاهد هذا المنتج ${randomViewers} شخصاً
          </div>

          <div class="product-price-row large">
            <span class="price">${product.price} ${STORE_CONFIG.currency}</span>
            <span class="old-price">${product.oldPrice ? product.oldPrice + ' ' + STORE_CONFIG.currency : ''}</span>
          </div>
          
          <div class="product-rating" style="display: flex; align-items: center; gap: 8px; margin: 10px 0; color: #ffaa00; font-size: 14px;">
            <span>⭐⭐⭐⭐⭐</span>
            <strong style="color: #fff;">4.9 / 5</strong>
            <span style="color: #888;">(142 تقييم عميل)</span>
          </div>

          <p class="details-desc">${product.description || product.shortDesc || ''}</p>
          <ul class="specs-list">
            ${(product.specs || ["ضمان أصلية 100%", "شحن سريع"]).map(s => `<li>✓ ${s}</li>`).join("")}
          </ul>

          <div class="qty-selector">
            <span>الكمية:</span>
            <button onclick="changeDetailQty(-1)">−</button>
            <span id="detailQty">1</span>
            <button onclick="changeDetailQty(1)">+</button>
          </div>
          <div class="details-actions">
            <button class="btn btn-outline btn-lg" onclick="addDetailToCart(${product.id})">إضافة إلى السلة</button>
            <button class="btn btn-primary btn-lg" onclick="buyNow(${product.id})">شراء الآن</button>
          </div>
        </div>
      </div>
    </div>
  `;
  window._detailQty = 1;
}

function changeDetailQty(delta) {
  window._detailQty = Math.max(1, (window._detailQty || 1) + delta);
  const qtyEl = document.getElementById("detailQty");
  if (qtyEl) qtyEl.textContent = window._detailQty;
}

function addDetailToCart(id) {
  Cart.add(id, window._detailQty || 1);
  showToast("تمت إضافة المنتج إلى السلة");
}

function buyNow(id) {
  Cart.add(id, window._detailQty || 1);
  navigate("checkout");
}

// ---------- السلة ----------
function renderCartView() {
  const el = document.getElementById("view-cart");
  if (!el) return;

  const items = Cart.detailedItems();

  if (!items || items.length === 0) {
    el.innerHTML = `
      <div class="container" style="padding: 60px 0; text-align: center;">
        <h1 class="page-title">سلة التسوق</h1>
        <div class="empty-state">
          <div class="empty-icon" style="font-size: 50px; margin-bottom: 15px;">🛒</div>
          <p style="color: var(--text-muted); font-size: 18px;">السلة فارغة</p>
          <button class="btn btn-primary" onclick="navigate('home')" style="margin-top: 20px;">تصفح المنتجات</button>
        </div>
      </div>`;
    return;
  }

  const rows = items.map(i => `
    <div class="cart-row" style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid var(--border);">
      <img src="${i.image}" alt="${i.name}" style="width: 60px; height: 60px; object-fit: contain;" onerror="this.src='assets/logo.jpg'">
      <div class="cart-row-info" style="flex: 1; padding: 0 15px; text-align: right;">
        <h4 style="margin: 0 0 5px; color: var(--text-main);">${i.name}</h4>
        <span class="price" style="color: var(--accent-green); font-weight: bold;">${i.price} ${STORE_CONFIG.currency}</span>
      </div>
      <div class="cart-qty" style="display: flex; align-items: center; gap: 10px;">
        <button onclick="Cart.decrease(${i.id}); renderCartView(); Cart.updateCounter();" style="padding: 5px 10px; background: var(--bg-body); border: 1px solid var(--border); color: var(--text-main); cursor: pointer; border-radius: 4px;">−</button>
        <span>${i.qty}</span>
        <button onclick="Cart.increase(${i.id}); renderCartView(); Cart.updateCounter();" style="padding: 5px 10px; background: var(--bg-body); border: 1px solid var(--border); color: var(--text-main); cursor: pointer; border-radius: 4px;">+</button>
      </div>
      <div class="cart-row-total" style="font-weight: bold; padding: 0 15px;">${i.price * i.qty} ${STORE_CONFIG.currency}</div>
      <button class="remove-btn" onclick="Cart.remove(${i.id}); renderCartView(); Cart.updateCounter();" style="background: none; border: none; color: var(--danger); font-size: 18px; cursor: pointer;">✕</button>
    </div>
  `).join("");

  el.innerHTML = `
    <div class="container" style="padding: 40px 20px;">
      <h1 class="page-title" style="margin-bottom: 25px; text-align: right;">سلة التسوق</h1>
      <div class="cart-layout" style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
        <div class="cart-items">
          ${rows}
          <button class="btn btn-text" onclick="Cart.clear(); renderCartView(); Cart.updateCounter();" style="margin-top: 15px; color: var(--danger); background: none; border: none; cursor: pointer; font-weight: bold;">إفراغ السلة</button>
        </div>
        <div class="cart-summary" style="background: var(--bg-card); padding: 20px; border-radius: var(--radius); border: 1px solid var(--border); height: fit-content;">
          <h3 style="margin-bottom: 15px;">ملخص الطلب</h3>
          <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--text-muted);"><span>المجموع الفرعي</span><span>${Cart.subtotal()} ${STORE_CONFIG.currency}</span></div>
          <div class="summary-row total" style="display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; font-size: 18px; color: var(--text-main);"><span>الإجمالي</span><span>${Cart.total()} ${STORE_CONFIG.currency}</span></div>
          <button class="btn btn-primary btn-lg full" onclick="navigate('checkout')" style="width: 100%; margin-bottom: 10px; padding: 12px; background: var(--primary); color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">إتمام الطلب</button>
          <button class="btn btn-outline full" onclick="navigate('home')" style="width: 100%; padding: 12px; background: none; border: 1px solid var(--border); color: var(--text-main); border-radius: 8px; font-weight: bold; cursor: pointer;">متابعة التسوق</button>
        </div>
      </div>
    </div>`;
}

// ---------- الدفع ----------
function renderCheckoutView() {
  const el = document.getElementById("view-checkout");
  if (!el) return;
  const items = Cart.detailedItems();

  if (items.length === 0) {
    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">إتمام الطلب</h1>
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <p>السلة فارغة، أضف منتجات أولاً</p>
          <button class="btn btn-primary" onclick="navigate('home')">تصفح المنتجات</button>
        </div>
      </div>`;
    return;
  }

  const rows = items.map(i => `
    <div class="summary-row">
      <span>${i.name} × ${i.qty}</span>
      <span>${i.price * i.qty} ${STORE_CONFIG.currency}</span>
    </div>
  `).join("");

  el.innerHTML = `
    <div class="container">
      <h1 class="page-title">إتمام الطلب</h1>
      <div class="checkout-layout">
        <form id="checkoutForm" class="checkout-form">
          <div class="form-group">
            <label>الاسم الكامل</label>
            <input type="text" id="fName" placeholder="مثال: أحمد محمد">
            <span class="error" id="err-fName"></span>
          </div>
          <div class="form-group">
            <label>رقم الهاتف</label>
            <input type="tel" id="fPhone" placeholder="01xxxxxxxxx" maxlength="11" inputmode="numeric">
            <span class="error" id="err-fPhone"></span>
          </div>
          <div class="form-group">
            <label>رقم واتساب</label>
            <input type="tel" id="fWhatsapp" placeholder="01xxxxxxxxx" maxlength="11" inputmode="numeric">
            <span class="error" id="err-fWhatsapp"></span>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>المحافظة</label>
              <select id="fProvince">
                <option value="">اختر المحافظة</option>
                ${EGYPT_GOVERNORATES.map(gov => `<option value="${gov}">${gov}</option>`).join("")}
              </select>
              <span class="error" id="err-fProvince"></span>
            </div>
            <div class="form-group">
              <label>المدينة</label>
              <input type="text" id="fCity" placeholder="مثال: مدينة نصر">
              <span class="error" id="err-fCity"></span>
            </div>
          </div>
          <div class="form-group">
            <label>العنوان بالتفصيل</label>
            <textarea id="fAddress" rows="3" placeholder="اسم الشارع، رقم المبنى، علامة مميزة..."></textarea>
            <span class="error" id="err-fAddress"></span>
          </div>
          <div class="form-group">
            <label>ملاحظات إضافية (اختياري)</label>
            <textarea id="fNotes" rows="2" placeholder="أي تفاصيل إضافية..."></textarea>
          </div>
          <button type="button" id="confirmOrderBtn" class="btn btn-primary btn-lg full">تأكيد الطلب</button>
        </form>
        <div class="cart-summary">
          <h3>ملخص الطلب</h3>
          ${rows}
          <div class="summary-row total"><span>الإجمالي</span><span>${Cart.total()} ${STORE_CONFIG.currency}</span></div>
        </div>
      </div>
    </div>`;

  setTimeout(() => {
    const btn = document.getElementById("confirmOrderBtn");
    if (btn) {
      btn.onclick = executeOrderSubmission;
    }
    ["fPhone", "fWhatsapp"].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("input", () => {
          input.value = input.value.replace(/[^0-9]/g, "").slice(0, 11);
        });
      }
    });
  }, 100);
}

async function executeOrderSubmission(e) {
  if (e) e.preventDefault();

  const fields = {
    fName: "يرجى إدخال الاسم",
    fPhone: "يرجى إدخال رقم الهاتف",
    fWhatsapp: "يرجى إدخال رقم واتساب",
    fProvince: "يرجى إدخال المحافظة",
    fCity: "يرجى إدخال المدينة",
    fAddress: "يرجى إدخال العنوان"
  };

  let valid = true;
  const values = {};
  for (const [id, msg] of Object.entries(fields)) {
    const input = document.getElementById(id);
    const errEl = document.getElementById(`err-${id}`);
    if (input) {
      values[id] = input.value.trim();
      if (!values[id]) {
        if (errEl) errEl.textContent = msg;
        valid = false;
      } else {
        if (errEl) errEl.textContent = "";
      }
    }
  }

  ["fPhone", "fWhatsapp"].forEach(id => {
    const errEl = document.getElementById(`err-${id}`);
    if (values[id] && !EGY_PHONE_REGEX.test(values[id])) {
      if (errEl) errEl.textContent = "يرجى إدخال رقم مصري صحيح (11 رقم يبدأ بـ 01)";
      valid = false;
    }
  });

  if (!valid) return;

  const items = Cart.detailedItems();
  const orderNumber = "QR-" + Math.floor(100000 + Math.random() * 900000);
  const itemsText = items.map(i => `• ${i.name} (×${i.qty}) - ${i.price * i.qty} ${STORE_CONFIG.currency}`).join("\n");

  const order = {
    orderNumber: orderNumber,
    name: values.fName,
    phone: values.fPhone,
    whatsapp: values.fWhatsapp,
    province: values.fProvince,
    city: values.fCity,
    address: values.fAddress,
    notes: document.getElementById("fNotes") ? document.getElementById("fNotes").value.trim() : '',
    items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
    total: Cart.total(),
    date: new Date().toLocaleDateString("ar-EG"),
    status: "بانتظار التأكيد",
    createdAt: Date.now()
  };

  if (typeof firebase !== 'undefined') {
    try {
      const db = firebase.firestore();
      await db.collection("orders").add(order);
    } catch (err) {
      console.error("خطأ في رفع الطلب للسحابة:", err);
    }
  }

  let savedOrders = JSON.parse(localStorage.getItem('wt_store_orders') || '[]');
  savedOrders.push(order);
  localStorage.setItem('wt_store_orders', JSON.stringify(savedOrders));

  const botToken = '8975813774:AAGEM7r1snpX5tIhckDsqQewl130GQ624Iw';
  const chatId = '5535861156';

  const telegramMessage = `
🔔 طلب جديد من متجر WT Store!

🔖 رقم الطلب: ${orderNumber}
👤 الاسم: ${values.fName}
📞 الهاتف: ${values.fPhone}
💬 واتساب: ${values.fWhatsapp}
📍 المحافظة: ${values.fProvince}
🏙️ المدينة: ${values.fCity}
🏠 العنوان: ${values.fAddress}
📝 ملاحظات: ${order.notes || 'لا يوجد'}

🛒 تفاصيل المنتجات:
${itemsText}

💰 الإجمالي: ${order.total} ${STORE_CONFIG.currency}
  `.trim();

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage,
        parse_mode: 'HTML'
      })
    });
  } catch (error) {
    console.error('خطأ في إرسال تليجرام:', error);
  }

  Cart.clear();
  window._lastOrder = order;
  navigate("success");
  setTimeout(() => renderSuccessView(order), 50);
}

// ---------- صفحة نجاح الطلب ----------
function renderSuccessView(order) {
  order = order || window._lastOrder;
  const el = document.getElementById("view-success");
  if (!el) return;
  if (!order) {
    el.innerHTML = `<div class="container"><p>لا يوجد طلب حديث لعرضه.</p></div>`;
    return;
  }
  el.innerHTML = `
    <div class="container success-view">
      <div class="success-icon">🎉</div>
      <h1>تم استلام طلبك بنجاح</h1>
      <div class="success-card">
        <div class="summary-row"><span>رقم الطلب</span><span>${order.orderNumber}</span></div>
        <div class="summary-row"><span>الاسم</span><span>${order.name}</span></div>
        <div class="summary-row"><span>الإجمالي</span><span>${order.total} ${STORE_CONFIG.currency}</span></div>
        <div class="summary-row"><span>الحالة</span><span class="status-badge">بانتظار التأكيد</span></div>
      </div>
      <div class="success-actions">
        <button class="btn btn-primary btn-lg" onclick="navigate('myorders')">عرض طلباتي</button>
        <button class="btn btn-text" onclick="navigate('home')">العودة للرئيسية</button>
      </div>
    </div>`;
}

// ---------- قسم "طلباتي" ----------
function renderMyOrdersView() {
  const el = document.getElementById("view-myorders");
  if (!el) return;

  const savedOrders = JSON.parse(localStorage.getItem('wt_store_orders') || '[]');
  
  if (savedOrders.length === 0) {
    el.innerHTML = `
      <div class="container" style="text-align: center; padding: 40px 0;">
        <h1 class="page-title">📦 طلباتي السابقة</h1>
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <p>لا توجد أي طلبات مسجلة من هذا المتصفح حتى الآن.</p>
          <button class="btn btn-primary" onclick="navigate('home')" style="margin-top: 15px;">تسوق الان</button>
        </div>
      </div>
    `;
    return;
  }

  let ordersHtml = savedOrders.reverse().map(order => {
    const status = order.status || "بانتظار التأكيد";
    let statusColor = "#ffaa00";
    if (status === "جاري التجهيز") statusColor = "#0088ff";
    if (status === "في طريقها للتوصيل") statusColor = "#00ff66";
    if (status === "تم التسليم") statusColor = "#00ff66";
    if (status === "ملغى") statusColor = "#ff5c5c";

    return `
      <div class="success-card" style="margin-bottom: 20px; text-align: right; border: 1px solid #222;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222; padding-bottom: 10px; margin-bottom: 10px;">
          <h3 style="margin: 0; color: #fff;">رقم الطلب: ${order.orderNumber}</h3>
          <span style="background: rgba(0,255,102,0.1); color: ${statusColor}; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 13px;">${status}</span>
        </div>
        <div class="summary-row"><span>اسم العميل:</span><span>${order.name}</span></div>
        <div class="summary-row"><span>الهاتف:</span><span>${order.phone}</span></div>
        <div class="summary-row"><span>العنوان:</span><span>${order.province} - ${order.city} - ${order.address}</span></div>
        <div class="summary-row"><span>الإجمالي:</span><span style="color: #00ff66; font-weight: bold;">${order.total} ${STORE_CONFIG.currency}</span></div>
        <div style="margin-top: 10px; font-size: 13px; color: #888;">تاريخ الطلب: ${order.date}</div>
      </div>
    `;
  }).join("");

  el.innerHTML = `
    <div class="container" style="max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 class="page-title" style="text-align: center; margin-bottom: 30px;">📦 طلباتي السابقة</h1>
      ${ordersHtml}
    </div>
  `;
}

// ---------- Toast ----------
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2800);
}

// ---------- القائمة الجوال ----------
function toggleMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  const hamburger = document.getElementById("hamburger");
  if (menu) menu.classList.toggle("open");
  if (hamburger) hamburger.classList.toggle("open");
}
function closeMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  const hamburger = document.getElementById("hamburger");
  if (menu) menu.classList.remove("open");
  if (hamburger) hamburger.classList.remove("open");
}

// ---------- النزول المباشر والسلس للأقسام بدون خربطة ----------
function scrollToSection(sectionId) {
  closeMobileMenu();
  const homeView = document.getElementById("view-home");
  
  if (homeView && !homeView.classList.contains("active")) {
    document.querySelectorAll(".view").forEach(v => {
      v.classList.remove("active");
      v.style.display = "none";
    });
    homeView.classList.add("active");
    homeView.style.display = "block";
  }

  setTimeout(() => {
    const el = document.getElementById(sectionId) || document.querySelector(`.${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 50);
}

// ---------- الاستماع لتغيير الهاش وتشغيل التوجيه ----------
window.addEventListener("hashchange", () => {
  const { view, params } = parseHash();
  renderView(view, params);
});

// ---------- بدء التشغيل ----------
document.addEventListener("DOMContentLoaded", () => {
  renderProductGrid();
  if (typeof Cart !== "undefined" && Cart.updateCounter) {
    Cart.updateCounter();
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (typeof STORE_CONFIG !== "undefined") {
    const fb = document.getElementById("footerFb");
    const wa = document.getElementById("footerWa");
    const ig = document.getElementById("footerIg");
    const wa2 = document.getElementById("footerWa2");

    if (fb) fb.href = STORE_CONFIG.facebookUrl;
    if (wa) wa.href = STORE_CONFIG.whatsappUrl;
    if (ig) ig.href = STORE_CONFIG.instagramUrl;
    if (wa2) wa2.href = STORE_CONFIG.whatsappUrl;
  }

  const { view, params } = parseHash();
  renderView(view, params);
});
