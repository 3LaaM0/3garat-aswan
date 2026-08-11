// ============================================
// التطبيق الرئيسي - التنقل بين الصفحات وعرض المحتوى
// ============================================

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
    document.getElementById("trackingResult").style.display = "none";
  }
}

window.addEventListener("hashchange", () => {
  const { view, params } = parseHash();
  renderView(view, params);
});

// ---------- الرئيسية: عرض المنتجات ----------
function renderProductGrid() {
  const grid = document.getElementById("productsGrid");
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

// ---------- صفحة تفاصيل المنتج ----------
function renderProductDetails(id) {
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  const el = document.getElementById("view-product");
  el.innerHTML = `
    <div class="container product-details fade-in">
      <button class="back-btn" onclick="navigate('home')">→ العودة للمنتجات</button>
      <div class="details-grid">
        <div class="details-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="details-info">
          <h1>${product.name}</h1>
          <div class="product-price-row large">
            <span class="price">${product.price} ${STORE_CONFIG.currency}</span>
            <span class="old-price">${product.oldPrice} ${STORE_CONFIG.currency}</span>
          </div>
          <p class="details-desc">${product.description}</p>
          <ul class="specs-list">
            ${product.specs.map(s => `<li>✓ ${s}</li>`).join("")}
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
  document.getElementById("detailQty").textContent = window._detailQty;
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
        <form id="checkoutForm" class="checkout-form fade-in" onsubmit="submitOrder(event)">
          <div class="form-group">
            <label>الاسم الكامل</label>
            <input type="text" id="fName" placeholder="مثال: أحمد محمد">
            <span class="error" id="err-fName"></span>
          </div>
          <div class="form-group">
            <label>رقم الهاتف</label>
            <input type="tel" id="fPhone" placeholder="01xxxxxxxxx">
            <span class="error" id="err-fPhone"></span>
          </div>
          <div class="form-group">
            <label>رقم واتساب</label>
            <input type="tel" id="fWhatsapp" placeholder="01xxxxxxxxx">
            <span class="error" id="err-fWhatsapp"></span>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>المحافظة</label>
              <input type="text" id="fProvince" placeholder="مثال: القاهرة">
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
          <button type="submit" class="btn btn-primary btn-lg full">تأكيد الطلب</button>
        </form>
        <div class="cart-summary fade-in">
          <h3>ملخص الطلب</h3>
          ${rows}
          <div class="summary-row total"><span>الإجمالي</span><span>${Cart.total()} ${STORE_CONFIG.currency}</span></div>
        </div>
      </div>
    </div>`;
}

async function submitOrder(e) {
  e.preventDefault();

  // منع أي تشغيل للدالة إذا لم يكن المستخدم في صفحة الدفع (مثل الضغط على زرار تسوق الآن)
  const checkoutForm = document.getElementById("checkoutForm");
  if (!checkoutForm) return;

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
    values[id] = input.value.trim();
    if (!values[id]) {
      errEl.textContent = msg;
      valid = false;
    } else {
      errEl.textContent = "";
    }
  }
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
    notes: document.getElementById("fNotes").value.trim(),
    items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
    total: Cart.total(),
    date: new Date().toLocaleDateString("ar-EG"),
    status: "بانتظار التأكيد"
  };

  // إرسال البيانات مباشرة إلى تليجرام
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

  try {
    if (typeof Orders !== 'undefined' && Orders.save) {
      Orders.save(order);
      if (Orders.sendToAutomation) Orders.sendToAutomation(order);
    }
  } catch (err) {
    console.log(err);
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

// ---------- تتبع الطلب ----------
function submitTracking(e) {
  e.preventDefault();
  const orderNumber = document.getElementById("trackOrderNumber").value.trim();
  const phone = document.getElementById("trackPhone").value.trim();
  if (!orderNumber || !phone) {
    showToast("يرجى إدخال رقم الطلب ورقم الهاتف");
    return;
  }
  const order = Orders.findByNumberAndPhone(orderNumber, phone);
  renderTrackingResult(order);
}

// ---------- Toast ----------
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2800);
}

// ---------- القائمة على الجوال ----------
function toggleMobileMenu() {
  document.getElementById("mobileMenu").classList.toggle("open");
  document.getElementById("hamburger").classList.toggle("open");
}
function closeMobileMenu() {
  document.getElementById("mobileMenu").classList.remove("open");
  document.getElementById("hamburger").classList.remove("open");
}

// ---------- بدء التشغيل ----------
document.addEventListener("DOMContentLoaded", () => {
  renderProductGrid();
  Cart.updateCounter();
  document.getElementById("year").textContent = new Date().getFullYear();

  // ربط روابط التواصل الاجتماعي
  document.getElementById("footerFb").href = STORE_CONFIG.facebookUrl;
  document.getElementById("footerWa").href = STORE_CONFIG.whatsappUrl;
  document.getElementById("footerIg").href = STORE_CONFIG.instagramUrl;
  document.getElementById("footerWa2").href, STORE_CONFIG.whatsappUrl;

  const { view, params } = parseHash();
  renderView(view, params);
});
