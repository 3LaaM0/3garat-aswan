// ============================================
// التطبيق الرئيسي - متجر WT Store الاحترافي
// ============================================

const EGY_PHONE_REGEX = /^01[0125][0-9]{8}$/;

const EGYPT_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة",
  "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية",
  "الوادي الجديد", "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد",
  "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر",
  "قنا", "شمال سيناء", "سوهاج"
];

// حقن تنسيقات شبكة المنتجات
if (!document.getElementById("page-motion-styles")) {
  const style = document.createElement("style");
  style.id = "page-motion-styles";
  style.innerHTML = `
    @keyframes pulse-dot {
      0% { transform: scale(0.95); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.4; }
      100% { transform: scale(0.95); opacity: 1; }
    }
    #productsGrid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 280px));
      justify-content: center;
      gap: 20px;
    }
  `;
  document.head.appendChild(style);
}

// السلايدر المباشر بالصفحة الرئيسية
let currentSlide = 0;
function moveSlide(direction) {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + direction + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
}
setInterval(() => moveSlide(1), 5000);

function navigate(view, params = {}) {
  closeMobileMenu();
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

function renderView(view, params) {
  window.scrollTo({ top: 0, behavior: "smooth" });

  const target = document.getElementById(`view-${view}`) || document.getElementById("view-home");
  
  document.querySelectorAll(".view").forEach(v => {
    v.classList.remove("active");
    v.style.display = ""; 
  });
  
  target.classList.add("active");
  executeViewRender(view, params);
}

function executeViewRender(view, params) {
  if (view === "products") renderProductGrid(window._currentCat || 'الكل');
  if (view === "product") renderProductDetails(params.id);
  if (view === "cart") renderCartView();
  if (view === "checkout") renderCheckoutView();
  if (view === "myorders") renderMyOrdersView();
}

let cloudProducts = [];

function initCloudProducts() {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      const firebaseConfig = {
        apiKey: "AIzaSyBgiUuOxa9JKG3lTonpl8uYPaJBlUSisAU",
        authDomain: "wt-store-a71af-3c9a7.firebaseapp.com",
        projectId: "wt-store-a71af-3c9a7",
        storageBucket: "wt-store-a71af-3c9a7.appspot.com",
        messagingSenderId: "500683952997",
        appId: "1:500683952997:web:f64872a5676cde173e878c"
      };
      firebase.initializeApp(firebaseConfig);
    }

    const db = firebase.firestore();
    db.collection("products").onSnapshot((snapshot) => {
      cloudProducts = [];
      snapshot.forEach((doc) => {
        cloudProducts.push({ docId: doc.id, ...doc.data() });
      });
      
      updateProductCounts();

      const { view, params } = parseHash();
      if (view === "products") renderProductGrid(window._currentCat || 'الكل');
      if (view === "product" && params.id) renderProductDetails(params.id);
    }, (error) => {
      console.error("خطأ في جلب المنتجات السحابية:", error);
    });
  }
}

function updateProductCounts() {
  const count = cloudProducts.length;
  const countText = document.getElementById('productsCountText');
  const aboutCount = document.getElementById('aboutProductsCount');

  if (countText) countText.textContent = `يتوفر لدينا الآن ${count} منتج أصلية ومضمونة`;
  if (aboutCount) aboutCount.textContent = count + "+";
}

function getActiveProducts() {
  if (cloudProducts && cloudProducts.length > 0) return cloudProducts;
  return typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
}

// دالة فتح قسم معين مباشرة من الصفحة الرئيسية
window.openCategory = function(cat) {
  window._currentCat = cat;
  navigate('products');
  setTimeout(() => {
    filterCategory(cat);
  }, 50);
};

// تصفية الأقسام (سماعات، شواحن، وصلات)
window.filterCategory = function(cat) {
  window._currentCat = cat;
  document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-cat-${cat}`);
  if (activeBtn) activeBtn.classList.add('active');
  renderProductGrid(cat);
};

function renderProductGrid(selectedCategory = 'الكل') {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  let productsList = getActiveProducts();

  if (selectedCategory && selectedCategory !== 'الكل') {
    productsList = productsList.filter(p => (p.category || 'أخرى') === selectedCategory);
  }

  if (!productsList || productsList.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 18px; padding: 60px 0;">لا توجد منتجات متوفرة في قسم (${selectedCategory}) حالياً.</p>`;
    return;
  }

  grid.innerHTML = productsList.map(p => {
    const imgSrc = (p.images && p.images.length > 0) ? p.images[0] : (p.image || 'assets/logo.jpg');
    const stock = p.stock !== undefined ? parseInt(p.stock) : 10;
    const isOut = stock <= 0;

    const btnHtml = isOut
      ? `<button class="btn" disabled style="background:#444; color:#aaa; cursor:not-allowed; flex:1;">نفد المخزون ❌</button>`
      : `<button class="btn btn-primary" onclick="quickAddToCart(${p.id}, event)" style="flex:1;">إضافة للسلة</button>`;

    return `
      <div class="product-card fade-in-up" style="width: 100%;">
        <div class="product-image" onclick="navigate('product', {id: ${p.id}})" style="cursor: pointer;">
          <img src="${imgSrc}" alt="${p.name}" loading="lazy" onerror="this.src='assets/logo.jpg'">
        </div>
        <div class="product-body">
          <h3 class="product-name" onclick="navigate('product', {id: ${p.id}})" style="cursor: pointer;">${p.name}</h3>
          <p class="product-desc">${p.shortDesc || ''}</p>
          <div class="product-price-row">
            <span class="price">${p.price} ${STORE_CONFIG.currency || 'ج.م'}</span>
            <span class="old-price">${p.oldPrice ? p.oldPrice + ' ' + (STORE_CONFIG.currency || 'ج.م') : ''}</span>
          </div>
          <div class="product-actions">
            <button class="btn btn-outline" onclick="navigate('product', {id: ${p.id}})" style="flex:1;">التفاصيل</button>
            ${btnHtml}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function quickAddToCart(id, e) {
  e.stopPropagation();
  Cart.add(id, 1);
  showToast("تمت إضافة المنتج إلى السلة بنجاح 🛍️");
}

function renderProductDetails(id) {
  const productsList = getActiveProducts();
  const el = document.getElementById("view-product");
  if (!el) return;

  const product = productsList.find(p => String(p.id) === String(id));

  if (!product) {
    el.innerHTML = `
      <div class="container" style="text-align:center; padding:100px 20px;">
        <h2 style="color:var(--primary);">جاري تحميل تفاصيل المنتج... ⏳</h2>
      </div>`;
    return;
  }

  const randomViewers = Math.floor(Math.random() * (125 - 45 + 1)) + 45;
  const productImages = (product.images && product.images.length > 0) ? product.images : [product.image || 'assets/logo.jpg'];
  
  const stock = product.stock !== undefined ? parseInt(product.stock) : 10;
  const isOut = stock <= 0;

  const actionsHtml = isOut
    ? `<button class="btn btn-lg full" disabled style="background:#444; color:#aaa; cursor:not-allowed; border:none;">عذراً، نفد المخزون ❌</button>`
    : `<button class="btn btn-outline btn-lg" onclick="addDetailToCart(${product.id})">إضافة إلى السلة</button>
       <button class="btn btn-primary btn-lg" onclick="buyNow(${product.id})">شراء الآن</button>`;

  el.innerHTML = `
    <div class="container product-details">
      <button class="back-btn" onclick="navigate('products')">← العودة للمنتجات</button>
      <div class="details-grid">
        <div class="details-gallery">
          <div class="details-image" style="margin-bottom: 12px; overflow: hidden; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-card);">
            <img id="mainProductImg" src="${productImages[0]}" alt="${product.name}" style="width: 100%; height: 350px; object-fit: contain;" onerror="this.src='assets/logo.jpg'">
          </div>
          ${productImages.length > 1 ? `
            <div class="gallery-thumbs" style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px;">
              ${productImages.map((imgSrc, idx) => `
                <img src="${imgSrc}" onclick="changeMainImage('${imgSrc}', this)" style="width: 70px; height: 70px; min-width: 70px; object-fit: contain; border-radius: 8px; border: 2px solid ${idx === 0 ? '#10b981' : 'var(--border)'}; cursor: pointer; background: var(--bg-card); padding: 4px; transition: border-color 0.2s;" alt="صورة مصغرة">
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div class="details-info">
          <h1>${product.name}</h1>
          
          <div class="live-viewers" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(0, 255, 102, 0.1); color: #00ff66; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 10px; border: 1px solid rgba(0, 255, 102, 0.2);">
            <span style="width: 8px; height: 8px; background-color: #00ff66; border-radius: 50%; display: inline-block; animation: pulse-dot 1.5s infinite;"></span>
            🔥 الآن يُشاهد هذا المنتج ${randomViewers} شخصاً
          </div>

          <div class="product-price-row large">
            <span class="price">${product.price} ${STORE_CONFIG.currency || 'ج.م'}</span>
            <span class="old-price">${product.oldPrice ? p.oldPrice + ' ' + (STORE_CONFIG.currency || 'ج.م') : ''}</span>
          </div>

          <p class="details-desc">${product.description || product.shortDesc || ''}</p>

          ${!isOut ? `
          <div class="qty-selector">
            <span>الكمية:</span>
            <button onclick="changeDetailQty(-1)">−</button>
            <span id="detailQty">1</span>
            <button onclick="changeDetailQty(1)">+</button>
          </div>` : ''}
          
          <div class="details-actions">
            ${actionsHtml}
          </div>
        </div>
      </div>
    </div>
  `;
  window._detailQty = 1;
}

window.changeMainImage = function(src, thumbEl) {
  const mainImg = document.getElementById('mainProductImg');
  if (mainImg) mainImg.src = src;
  if (thumbEl) {
    const thumbs = thumbEl.parentElement.querySelectorAll('img');
    thumbs.forEach(t => t.style.borderColor = 'var(--border)');
    thumbEl.style.borderColor = '#10b981';
  }
};

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
          <button class="btn btn-primary" onclick="navigate('products')" style="margin-top: 20px;">تصفح المنتجات</button>
        </div>
      </div>`;
    return;
  }

  const rows = items.map(i => {
    const imgSrc = (i.images && i.images.length > 0) ? i.images[0] : (i.image || 'assets/logo.jpg');
    return `
      <div class="cart-row" style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid var(--border);">
        <img src="${imgSrc}" alt="${i.name}" style="width: 60px; height: 60px; object-fit: contain;" onerror="this.src='assets/logo.jpg'">
        <div class="cart-row-info" style="flex: 1; padding: 0 15px; text-align: right;">
          <h4 style="margin: 0 0 5px; color: var(--text-main);">${i.name}</h4>
          <span class="price" style="color: #10b981; font-weight: bold;">${i.price} ${STORE_CONFIG.currency || 'ج.م'}</span>
        </div>
        <div class="cart-qty" style="display: flex; align-items: center; gap: 10px;">
          <button onclick="Cart.decrease(${i.id}); renderCartView(); Cart.updateCounter();" style="padding: 5px 10px;">−</button>
          <span>${i.qty}</span>
          <button onclick="Cart.increase(${i.id}); renderCartView(); Cart.updateCounter();" style="padding: 5px 10px;">+</button>
        </div>
        <div class="cart-row-total" style="font-weight: bold; padding: 0 15px;">${i.price * i.qty} ${STORE_CONFIG.currency || 'ج.م'}</div>
        <button class="remove-btn" onclick="Cart.remove(${i.id}); renderCartView(); Cart.updateCounter();" style="background: none; border: none; color: var(--danger); font-size: 18px; cursor: pointer;">✕</button>
      </div>
    `;
  }).join("");

  el.innerHTML = `
    <div class="container" style="padding: 40px 20px;">
      <h1 class="page-title" style="margin-bottom: 25px; text-align: right;">سلة التسوق</h1>
      <div class="cart-layout" style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
        <div class="cart-items">${rows}</div>
        <div class="cart-summary" style="background: var(--bg-card); padding: 20px; border-radius: var(--radius); border: 1px solid var(--border);">
          <h3>ملخص الطلب</h3>
          <div class="summary-row total"><span>الإجمالي</span><span>${Cart.total()} ${STORE_CONFIG.currency || 'ج.م'}</span></div>
          <button class="btn btn-primary full" onclick="navigate('checkout')" style="width: 100%; margin-top: 15px; padding: 12px;">إتمام الطلب</button>
        </div>
      </div>
    </div>`;
}

function renderCheckoutView() {
  const el = document.getElementById("view-checkout");
  if (!el) return;
  const items = Cart.detailedItems();

  if (items.length === 0) {
    el.innerHTML = `<div class="container" style="text-align:center; padding:50px;"><p>السلة فارغة</p></div>`;
    return;
  }

  el.innerHTML = `
    <div class="container">
      <h1 class="page-title">إتمام الطلب</h1>
      <div class="checkout-layout">
        <form id="checkoutForm" class="checkout-form">
          <div class="form-group"><label>الاسم الكامل</label><input type="text" id="fName"><span class="error" id="err-fName"></span></div>
          <div class="form-group"><label>رقم الهاتف</label><input type="tel" id="fPhone" maxlength="11"><span class="error" id="err-fPhone"></span></div>
          <div class="form-group"><label>رقم واتساب</label><input type="tel" id="fWhatsapp" maxlength="11"><span class="error" id="err-fWhatsapp"></span></div>
          <div class="form-group">
            <label>المحافظة</label>
            <select id="fProvince"><option value="">اختر المحافظة</option>${EGYPT_GOVERNORATES.map(gov => `<option value="${gov}">${gov}</option>`).join("")}</select>
            <span class="error" id="err-fProvince"></span>
          </div>
          <div class="form-group"><label>المدينة</label><input type="text" id="fCity"><span class="error" id="err-fCity"></span></div>
          <div class="form-group"><label>العنوان بالتفصيل</label><textarea id="fAddress" rows="3"></textarea><span class="error" id="err-fAddress"></span></div>
          <div class="form-group">
            <label>طريقة الدفع</label>
            <select id="fPaymentMethod" style="width: 100%; padding: 12px; background: var(--bg-body); color: var(--text-main); border: 1px solid var(--border); border-radius: 8px;">
              <option value="الدفع عند الاستلام">الدفع عند الاستلام (كاش)</option>
              <option value="فودافون كاش">فودافون كاش</option>
              <option value="إنستا باي (InstaPay)">إنستا باي (InstaPay)</option>
            </select>
          </div>
          <button type="button" id="confirmOrderBtn" class="btn btn-primary full" style="margin-top: 15px;">تأكيد الطلب</button>
        </form>
        <div class="cart-summary">
          <h3>ملخص الطلب</h3>
          <div class="summary-row total"><span>الإجمالي النهائي</span><span style="color:#10b981;">${Cart.total()} ج.م</span></div>
        </div>
      </div>
    </div>`;

  setTimeout(() => {
    const btn = document.getElementById("confirmOrderBtn");
    if (btn) btn.onclick = executeOrderSubmission;
  }, 100);
}

async function executeOrderSubmission(e) {
  if (e) e.preventDefault();
  const fields = { fName: "أدخل الاسم", fPhone: "أدخل الهاتف", fWhatsapp: "أدخل الواتساب", fProvince: "اختر المحافظة", fCity: "أدخل المدينة", fAddress: "أدخل العنوان" };
  let valid = true;
  const values = {};
  for (const [id, msg] of Object.entries(fields)) {
    const input = document.getElementById(id);
    const errEl = document.getElementById(`err-${id}`);
    if (input) {
      values[id] = input.value.trim();
      if (!values[id]) { if (errEl) errEl.textContent = msg; valid = false; }
      else { if (errEl) errEl.textContent = ""; }
    }
  }
  if (!valid) return;

  const order = {
    orderNumber: "QR-" + Math.floor(100000 + Math.random() * 900000),
    name: values.fName, phone: values.fPhone, whatsapp: values.fWhatsapp,
    province: values.fProvince, city: values.fCity, address: values.fAddress,
    paymentMethod: document.getElementById("fPaymentMethod").value,
    total: Cart.total(), items: Cart.detailedItems(), date: new Date().toLocaleDateString("ar-EG"), status: "بانتظار التأكيد", createdAt: Date.now()
  };

  if (typeof firebase !== 'undefined') {
    try { await firebase.firestore().collection("orders").add(order); } catch (err) { console.error(err); }
  }

  let savedOrders = JSON.parse(localStorage.getItem('wt_store_orders') || '[]');
  savedOrders.push(order);
  localStorage.setItem('wt_store_orders', JSON.stringify(savedOrders));

  Cart.clear();
  window._lastOrder = order;
  navigate("success");
}

function renderSuccessView(order) {
  order = order || window._lastOrder;
  const el = document.getElementById("view-success");
  if (!el) return;
  el.innerHTML = `
    <div class="container success-view" style="text-align:center; padding:50px 20px;">
      <h1>🎉 تم استلام طلبك بنجاح!</h1>
      <p>رقم الطلب: ${order ? order.orderNumber : ''}</p>
      <button class="btn btn-primary" onclick="navigate('myorders')" style="margin-top:20px;">عرض طلباتي</button>
    </div>`;
}

function renderMyOrdersView() {
  const el = document.getElementById("view-myorders");
  if (!el) return;
  const savedOrders = JSON.parse(localStorage.getItem('wt_store_orders') || '[]');
  if (savedOrders.length === 0) {
    el.innerHTML = `<div class="container" style="text-align:center; padding:50px;"><p>لا توجد طلبات سابقة</p></div>`;
    return;
  }
  el.innerHTML = `
    <div class="container" style="max-width:800px; padding:20px;">
      <h1 class="page-title" style="text-align:center;">📦 طلباتي السابقة</h1>
      ${savedOrders.map(o => `
        <div style="background:var(--bg-card); padding:15px; border-radius:10px; margin-bottom:15px; border:1px solid var(--border);">
          <h3>رقم الطلب: ${o.orderNumber}</h3>
          <p>الإجمالي: ${o.total} ج.م</p>
        </div>
      `).join('')}
    </div>`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

function toggleMobileMenu() {
  document.getElementById("mobileMenu").classList.toggle("open");
}
function closeMobileMenu() {
  document.getElementById("mobileMenu").classList.remove("open");
}

function scrollToSection(sectionId) {
  closeMobileMenu();
  navigate('home');
  setTimeout(() => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, 100);
}

window.addEventListener("hashchange", () => {
  const { view, params } = parseHash();
  renderView(view, params);
});

document.addEventListener("DOMContentLoaded", () => {
  initCloudProducts(); 
  if (typeof Cart !== "undefined" && Cart.updateCounter) Cart.updateCounter();
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  const { view, params } = parseHash();
  renderView(view, params);
});
