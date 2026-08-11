// ============================================
// التطبيق الرئيسي - التنقل بين الصفحات وعرض المحتوى
// ============================================

// نمط رقم الهاتف المصري: يبدأ بـ 010 أو 011 أو 012 أو 015 ثم 8 أرقام (11 رقم بالإجمالي)
const EGY_PHONE_REGEX = /^01[0125][0-9]{8}$/;

// قائمة محافظات مصر الـ27
const EGYPT_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة",
  "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية",
  "الوادي الجديد", "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد",
  "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر",
  "قنا", "شمال سيناء", "سوهاج"
];

function navigate(view, params = {}) {
  window.scrollTo(0, 0);
  const hash = params.id ? `#${view}?id=${params.id}` : `#${view}`;
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  } else {
    renderView(view, params);
  }
  closeMobileMenu();
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

function renderView(view, params) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const target = document.getElementById(`view-${view}`);
  if (target) {
    target.classList.add("active");
  } else {
    document.getElementById("view-home").classList.add("active");
    view = "home";
  }

  if (view === "product") renderProductDetails(params.id);
  if (view === "cart") renderCartView();
  if (view === "checkout") renderCheckoutView();
  if (view === "tracking") {
    const res = document.getElementById("trackingResult");
    if (res) res.style.display = "none";
  }
}

window.addEventListener("hashchange", () => {
  const { view, params } = parseHash();
  renderView(view, params);
});

// ---------- الرئيسية: عرض المنتجات ----------
function renderProductGrid() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  grid.innerHTML = PRODUCTS.map(p => `
    <div class="product-card fade-in-up">
      <div class="product-image" onclick="navigate('product', {id: ${p.id}})">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-body">
        <h3 class="product-name" onclick="navigate('product', {id: ${p.id}})">${p.name}</h3>
        <p class="product-desc">${p.shortDesc}</p>
        <div class="product-price-row">
          <span class="price">${p.price} ${STORE_CONFIG.currency}</span>
          <span class="old-price">${p.oldPrice} ${STORE_CONFIG.currency}</span>
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
  showToast("تمت إضافة المنتج إلى السلة");
}

// ---------- صفحة تفاصيل المنتج (مع المشاهدات الحية والتقييمات) ----------
function renderProductDetails(id) {
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  const el = document.getElementById("view-product");
  if (!el) return;

  const randomViewers = Math.floor(Math.random() * (125 - 45 + 1)) + 45;

  el.innerHTML = `
    <div class="container product-details fade-in">
      <button class="back-btn" onclick="navigate('home')">← العودة للمنتجات</button>
      <div class="details-grid">
        <div class="details-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="details-info">
          <h1>${product.name}</h1>
          
          <div class="live-viewers" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 77, 77, 0.15); color: #ff4d4d; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 10px; border: 1px solid rgba(255, 77, 77, 0.3);">
            <span style="width: 8px; height: 8px; background-color: #ff4d4d; border-radius: 50%; display: inline-block; animation: pulse-dot 1.5s infinite;"></span>
            🔥 الآن يُشاهد هذا المنتج ${randomViewers} شخصاً
          </div>

          <div class="product-price-row large">
            <span class="price">${product.price} ${STORE_CONFIG.currency}</span>
            <span class="old-price">${product.oldPrice} ${STORE_CONFIG.currency}</span>
          </div>
          
          <div class="product-rating" style="display: flex; align-items: center; gap: 8px; margin: 10px 0; color: #ffaa00; font-size: 14px;">
            <span>⭐⭐⭐⭐⭐</span>
            <strong style="color: #fff;">4.9 / 5</strong>
            <span style="color: #888;">(142 تقييم عميل)</span>
          </div>

          <p class="details-desc">${product.description}</p>
          <ul class="specs-list">
            ${product.specs.map(s => `<li>✓ ${s}</li>`).join("")}
          </ul>

          <div class="customer-reviews-box" style="background: #151515; border: 1px solid #222; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #fff; margin-bottom: 8px; font-size: 15px;">💬 آراء بعض العملاء:</h4>
            <p style="color: #ccc; font-size: 13px; margin-bottom: 6px;">"المنتج وصلني أصلي وبنفس المواصفات، جودة الصوت والخامة ممتازة جداً أنصح به." - <b>محمد أ.</b></p>
            <p style="color: #ccc; font-size: 13px; margin: 0;">"سرعة في التوصيل وتغليف ممتاز، شكراً WT Store." - <b>محمود ع.</b></p>
          </div>

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

if (!document.getElementById('live-pulse-style')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'live-pulse-style';
  styleTag.innerHTML = `
  @keyframes pulse-dot {
    0% { transform: scale(0.95); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.4; }
    100% { transform: scale(0.95); opacity: 1; }
  }
  `;
  document.head.appendChild(styleTag);
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

  if (items.length === 0) {
    el.innerHTML = `
      <div class="container">
        <h1 class="page-title">سلة التسوق</h1>
        <div class="empty-state fade-in">
          <div class="empty-icon">🛒</div>
          <p>السلة فارغة</p>
          <button class="btn btn-primary" onclick="navigate('home')">تصفح المنتجات</button>
        </div>
      </div>`;
    return;
  }

  const rows = items.map(i => `
    <div class="cart-row fade-in">
      <img src="${i.image}" alt="${i.name}">
      <div class="cart-row-info">
        <h4>${i.name}</h4>
        <span class="price">${i.price} ${STORE_CONFIG.currency}</span>
      </div>
      <div class="cart-qty">
        <button onclick="Cart.decrease(${i.id}); renderCartView();">−</button>
        <span>${i.qty}</span>
        <button onclick="Cart.increase(${i.id}); renderCartView();">+</button>
      </div>
      <div class="cart-row-total">${i.price * i.qty} ${STORE_CONFIG.currency}</div>
      <button class="remove-btn" onclick="Cart.remove(${i.id}); renderCartView();">✕</button>
    </div>
  `).join("");

  el.innerHTML = `
    <div class="container">
      <h1 class="page-title">سلة التسوق</h1>
      <div class="cart-layout">
        <div class="cart-items">
          ${rows}
          <button class="btn btn-text" onclick="Cart.clear(); renderCartView();">إفراغ السلة</button>
        </div>
        <div class="cart-summary fade-in">
          <h3>ملخص الطلب</h3>
          <div class="summary-row"><span>المجموع الفرعي</span><span>${Cart.subtotal()} ${STORE_CONFIG.currency}</span></div>
          <div class="summary-row total"><span>الإجمالي</span><span>${Cart.total()} ${STORE_CONFIG.currency}</span></div>
          <button class="btn btn-primary btn-lg full" onclick="navigate('checkout')">إتمام الطلب</button>
          <button class="btn btn-outline full" onclick="navigate('home')">متابعة التسوق</button>
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
        <div class="empty-state fade-in">
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
        <form id="checkoutForm" class="checkout-form fade-in">
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
        <div class="cart-summary fade-in">
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
      if (errEl) errEl.textContent = "يرجى إدخال رقم مصري صحيح مكوّن من 11 رقم (يبدأ بـ 010 أو 011 أو 012 أو 015)";
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
    status: "بانتظار التأكيد"
  };

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
    <div class="container success-view fade-in">
      <div class="success-icon">🎉</div>
      <h1>تم استلام طلبك بنجاح</h1>
      <div class="success-card">
        <div class="summary-row"><span>رقم الطلب</span><span>${order.orderNumber}</span></div>
        <div class="summary-row"><span>الاسم</span><span>${order.name}</span></div>
        <div class="summary-row"><span>الإجمالي</span><span>${order.total} ${STORE_CONFIG.currency}</span></div>
        <div class="summary-row"><span>الحالة</span><span class="status-badge">بانتظار التأكيد</span></div>
      </div>
      <div class="success-actions">
        <button class="btn btn-primary btn-lg" onclick="navigate('tracking')">تتبع الطلب</button>
        <button class="btn btn-text" onclick="navigate('home')">العودة للرئيسية</button>
      </div>
    </div>`;
}

// ---------- تتبع الطلب (محدث ومضمون للحالات) ----------
function submitTracking(e) {
  e.preventDefault();
  const orderNumber = document.getElementById("trackOrderNumber").value.trim();
  const phone = document.getElementById("trackPhone").value.trim();
  
  if (!orderNumber || !phone) {
    showToast("يرجى إدخال رقم الطلب ورقم الهاتف");
    return;
  }

  const savedOrders = JSON.parse(localStorage.getItem('wt_store_orders') || '[]');
  const order = savedOrders.find(o => o.orderNumber === orderNumber && o.phone === phone);

  const resultEl = document.getElementById("trackingResult");
  if (!resultEl) return;
  resultEl.style.display = "block";

  if (!order) {
    resultEl.innerHTML = `
      <div class="success-card fade-in" style="margin-top: 20px; text-align: center; border: 1px solid #ff4d4d;">
        <p style="color: #ff4d4d;">عذراً، لم يتم العثور على طلب بهذا الرقم أو بيانات الهاتف غير صحيحة.</p>
      </div>
    `;
    return;
  }

  const status = order.status || "بانتظار التأكيد";

  // الألوان بناءً على حالة الطلب الحقيقية
  let s1 = "color: #00ff66;", s2 = "color: #888;", s3 = "color: #888;", s4 = "color: #888;";

  if (status === "جاري التجهيز") {
    s1 = "color: #00ff66;";
    s2 = "color: #00ff66;";
  } else if (status === "في طريقها للتوصيل") {
    s1 = "color: #00ff66;";
    s2 = "color: #00ff66;";
    s3 = "color: #00ff66;";
  } else if (status === "تم التسليم") {
    s1 = "color: #00ff66;";
    s2 = "color: #00ff66;";
    s3 = "color: #00ff66;";
    s4 = "color: #00ff66;";
  }

  resultEl.innerHTML = `
    <div class="success-card fade-in" style="margin-top: 20px;">
      <h3>تفاصيل تتبع الطلب: ${order.orderNumber}</h3>
      <div class="summary-row"><span>الاسم:</span><span>${order.name}</span></div>
      <div class="summary-row"><span>الإجمالي:</span><span>${order.total} ${STORE_CONFIG.currency}</span></div>
      <div class="summary-row"><span>الحالة الحالية:</span><span style="color: #00ff66; font-weight: bold;">${status}</span></div>
      
      <div class="tracking-steps" style="margin-top: 20px; text-align: right; line-height: 2;">
        <div style="${s1}">✔ <b>تم استلام الطلب</b> (جاري المراجعة والتأكيد)</div>
        <div style="${s2}">⏳ <b>جاري التجهيز</b> (المنتج يتم فحزه وتغليفه بعناية)</div>
        <div style="${s3}">📦 <b>في طريقها للتوصيل</b> (مع مندوب الشحن قريباً)</div>
        <div style="${s4}">🎉 <b>تم التسليم</b></div>
      </div>
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

// ---------- القائمة على الجوال ----------
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

// ---------- بدء التشغيل ----------
document.addEventListener("DOMContentLoaded", () => {
  renderProductGrid();
  Cart.updateCounter();
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const fb = document.getElementById("footerFb");
  const wa = document.getElementById("footerWa");
  const ig = document.getElementById("footerIg");
  const wa2 = document.getElementById("footerWa2");

  if (fb) fb.href = STORE_CONFIG.facebookUrl;
  if (wa) wa.href = STORE_CONFIG.whatsappUrl;
  if (ig) ig.href = STORE_CONFIG.instagramUrl;
  if (wa2) wa2.href = STORE_CONFIG.whatsappUrl;

  const { view, params } = parseHash();
  renderView(view, params);
});
function toggleStoreTheme() {
  const body = document.body;
  const btn = document.getElementById('storeThemeBtn');
  
  if (body.classList.contains('light-store-mode')) {
    body.classList.remove('light-store-mode');
    if(btn) btn.textContent = '🌙 الوضع الليلي';
    localStorage.setItem('wt_store_theme', 'dark');
  } else {
    body.classList.add('light-store-mode');
    if(btn) btn.textContent = '☀️ الوضع النهاري';
    localStorage.setItem('wt_store_theme', 'light');
  }
}

// تحميل الثيم المحفوظ عند فتح الموقع
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('wt_store_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-store-mode');
    const btn = document.getElementById('storeThemeBtn');
    if(btn) btn.textContent = '☀️ الوضع النهاري';
  }
});
