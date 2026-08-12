// ============================================
// التطبيق الرئيسي - متجر WT Store الاحترافي (سحابي ومتزامن)
// ============================================

const EGY_PHONE_REGEX = /^01[0125][0-9]{8}$/;

const EGYPT_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة",
  "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية",
  "الوادي الجديد", "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد",
  "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر",
  "قنا", "شمال سيناء", "سوهاج"
];

// حقن أنيميشن النقطة النابضة فقط
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

// دالة العرض - تم تصحيح مشكلة الإخفاء الإجباري هنا
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
  
  // إزالة أي أوامر إخفاء إجبارية من كل الصفحات
  document.querySelectorAll(".view").forEach(v => {
    v.classList.remove("active");
    v.style.display = ""; // هذا السطر يحل المشكلة جذرياً
  });
  
  target.classList.add("active");

  executeViewRender(view, params);
}

function executeViewRender(view, params) {
  if (view === "product") renderProductDetails(params.id);
  if (view === "cart") renderCartView();
  if (view === "checkout") renderCheckoutView();
  if (view === "myorders") renderMyOrdersView();
}

// ---------- جلب المنتجات السحابية الحية ----------
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
      renderProductGrid();
    }, (error) => {
      console.error("خطأ في جلب المنتجات السحابية:", error);
    });
  }
}

function getActiveProducts() {
  if (cloudProducts && cloudProducts.length > 0) return cloudProducts;
  const saved = localStorage.getItem('wt_custom_products');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { console.error(e); }
  }
  return typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
}

// ---------- عرض المنتجات بالرئيسية مع فحص المخزون ----------
function renderProductGrid() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  const productsList = getActiveProducts();

  if (!productsList || productsList.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 18px; padding: 60px 0;">لا توجد منتجات معروضة حالياً.</p>`;
    return;
  }

  grid.innerHTML = productsList.map(p => {
    // تحديد الصورة الأولى للمنتج
    const imgSrc = (p.images && p.images.length > 0) ? p.images[0] : (p.image || 'assets/logo.jpg');
    // فحص المخزون
    const stock = p.stock !== undefined ? parseInt(p.stock) : 10;
    const isOut = stock <= 0;

    const btnHtml = isOut
      ? `<button class="btn" disabled style="background:#444; color:#aaa; cursor:not-allowed; flex:1;">نفد المخزون ❌</button>`
      : `<button class="btn btn-primary" onclick="quickAddToCart(${p.id}, event)" style="flex:1;">إضافة للسلة</button>`;

    return `
      <div class="product-card fade-in-up">
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

// ---------- صفحة تفاصيل المنتج (بها معرض الصور والمخزون) ----------
function renderProductDetails(id) {
  const productsList = getActiveProducts();
  const product = productsList.find(p => p.id === id) || productsList[0];
  const el = document.getElementById("view-product");
  if (!el || !product) return;

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
      <button class="back-btn" onclick="navigate('home')">← العودة للمنتجات</button>
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
            <span class="old-price">${product.oldPrice ? product.oldPrice + ' ' + (STORE_CONFIG.currency || 'ج.م') : ''}</span>
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

// دالة تقليب الصور في تفاصيل المنتج
window.changeMainImage = function(src, thumbEl) {
  const mainImg = document.getElementById('mainProductImg');
  if (mainImg) mainImg.src = src;
  
  if (thumbEl) {
    const thumbs = thumbEl.parentElement.querySelectorAll('img');
    thumbs.forEach(t => t.style.borderColor = 'var(--border)');
    thumbEl.style.borderColor = '#10b981'; // إطار بلون مميز للصورة النشطة
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
          <button onclick="Cart.decrease(${i.id}); renderCartView(); Cart.updateCounter();" style="padding: 5px 10px; background: var(--bg-body); border: 1px solid var(--border); color: var(--text-main); cursor: pointer; border-radius: 4px;">−</button>
          <span>${i.qty}</span>
          <button onclick="Cart.increase(${i.id}); renderCartView(); Cart.updateCounter();" style="padding: 5px 10px; background: var(--bg-body); border: 1px solid var(--border); color: var(--text-main); cursor: pointer; border-radius: 4px;">+</button>
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
        <div class="cart-items">
          ${rows}
          <button class="btn btn-text" onclick="Cart.clear(); renderCartView(); Cart.updateCounter();" style="margin-top: 15px; color: var(--danger); background: none; border: none; cursor: pointer; font-weight: bold;">إفراغ السلة</button>
        </div>
        <div class="cart-summary" style="background: var(--bg-card); padding: 20px; border-radius: var(--radius); border: 1px solid var(--border); height: fit-content;">
          <h3 style="margin-bottom: 15px;">ملخص الطلب</h3>
          <div class="summary-row" style="display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--text-muted);"><span>المجموع الفرعي</span><span>${Cart.subtotal()} ${STORE_CONFIG.currency || 'ج.م'}</span></div>
          <div class="summary-row total" style="display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; font-size: 18px; color: var(--text-main);"><span>الإجمالي</span><span>${Cart.total()} ${STORE_CONFIG.currency || 'ج.م'}</span></div>
          <button class="btn btn-primary btn-lg full" onclick="navigate('checkout')" style="width: 100%; margin-bottom: 10px; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer;">إتمام الطلب</button>
          <button class="btn btn-outline full" onclick="navigate('home')" style="width: 100%; padding: 12px; background: none; border: 1px solid var(--border); color: var(--text-main); border-radius: 8px; font-weight: bold; cursor: pointer;">متابعة التسوق</button>
        </div>
      </div>
    </div>`;
}

// ---------- الدفع والبرومو كود وطرق الدفع ----------
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

  // تصفير الخصم المطبق عند دخول صفحة التشيك أوت
  window._appliedPromo = null;

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

          <!-- إضافة طرق الدفع -->
          <div class="form-group">
            <label>طريقة الدفع</label>
            <select id="fPaymentMethod" style="width: 100%; padding: 12px 14px; background: var(--bg-body); color: var(--text-main); border: 1px solid var(--border); border-radius: 10px;">
              <option value="الدفع عند الاستلام">الدفع عند الاستلام (كاش)</option>
              <option value="فودافون كاش">فودافون كاش</option>
              <option value="إنستا باي (InstaPay)">إنستا باي (InstaPay)</option>
            </select>
          </div>

          <!-- البرومو كود -->
          <div class="form-group" style="background:var(--bg-body); padding:15px; border-radius:10px; border:1px dashed var(--border); margin-top: 20px;">
            <label>هل لديك كود خصم؟</label>
            <div style="display:flex; gap:10px;">
              <input type="text" id="promoInput" placeholder="أدخل كود الخصم" style="flex:1; margin:0;">
              <button type="button" class="btn btn-outline" onclick="applyPromo()">تطبيق الخصم</button>
            </div>
            <p id="promoMsg" style="font-size:13px; margin-top:8px; font-weight:bold;"></p>
          </div>

          <div class="form-group">
            <label>ملاحظات إضافية (اختياري)</label>
            <textarea id="fNotes" rows="2" placeholder="أي تفاصيل إضافية..."></textarea>
          </div>
          <button type="button" id="confirmOrderBtn" class="btn btn-primary btn-lg full" style="margin-top: 15px;">تأكيد الطلب</button>
        </form>
        <div class="cart-summary">
          <h3>ملخص الطلب</h3>
          <div id="checkoutSummaryContainer"></div>
        </div>
      </div>
    </div>`;

  // تحديث السعر النهائي عند الفتح
  updateCheckoutSummary();

  setTimeout(() => {
    const btn = document.getElementById("confirmOrderBtn");
    if (btn) btn.onclick = executeOrderSubmission;
    
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

// دالة التحقق من البرومو كود وتطبيقه
window.applyPromo = async function() {
  const codeInput = document.getElementById('promoInput');
  const msgEl = document.getElementById('promoMsg');
  if (!codeInput || !msgEl) return;
  
  const code = codeInput.value.trim().toUpperCase();
  if (!code) return;

  msgEl.textContent = "جاري التحقق من الكود...";
  msgEl.style.color = "var(--text-muted)";

  try {
    const db = firebase.firestore();
    const snap = await db.collection("promo_codes").where("code", "==", code).where("active", "==", true).get();
    
    if (!snap.empty) {
      const promo = snap.docs[0].data();
      window._appliedPromo = { code: promo.code, value: promo.value };
      msgEl.textContent = `تم تطبيق خصم بقيمة ${promo.value} ج.م بنجاح! 🎉`;
      msgEl.style.color = "#10b981"; 
      updateCheckoutSummary();
    } else {
      window._appliedPromo = null;
      msgEl.textContent = "الكود غير صحيح، أو تم إيقافه.";
      msgEl.style.color = "var(--danger)";
      updateCheckoutSummary();
    }
  } catch (err) {
    console.error("خطأ في التحقق من الكود:", err);
    msgEl.textContent = "حدث خطأ في الشبكة.";
    msgEl.style.color = "var(--danger)";
  }
};

// تحديث الإجمالي في التشيك أوت ليعكس الخصم
window.updateCheckoutSummary = function() {
  const container = document.getElementById('checkoutSummaryContainer');
  if (!container) return;
  const items = Cart.detailedItems();
  const subtotal = Cart.total();
  let discountVal = window._appliedPromo ? window._appliedPromo.value : 0;
  let finalTotal = Math.max(0, subtotal - discountVal);

  let html = items.map(i => `<div class="summary-row"><span>${i.name} × ${i.qty}</span><span>${i.price * i.qty} ${STORE_CONFIG.currency || 'ج.م'}</span></div>`).join('');
  
  html += `<hr style="border: 0; border-top: 1px solid var(--border); margin: 15px 0;">`;
  html += `<div class="summary-row"><span>المجموع الفرعي</span><span>${subtotal} ${STORE_CONFIG.currency || 'ج.م'}</span></div>`;
  
  if (window._appliedPromo) {
    html += `<div class="summary-row" style="color:#10b981; font-weight:bold;"><span>الخصم (${window._appliedPromo.code})</span><span>-${discountVal} ${STORE_CONFIG.currency || 'ج.م'}</span></div>`;
  }
  
  html += `<div class="summary-row total" style="font-size: 18px; margin-top: 10px;"><span>الإجمالي النهائي</span><span style="color:#10b981;">${finalTotal} ${STORE_CONFIG.currency || 'ج.م'}</span></div>`;
  
  container.innerHTML = html;
};

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

  const paymentMethod = document.getElementById("fPaymentMethod") ? document.getElementById("fPaymentMethod").value : "الدفع عند الاستلام";
  const items = Cart.detailedItems();
  const subtotal = Cart.total();
  const discountVal = window._appliedPromo ? window._appliedPromo.value : 0;
  const finalTotal = Math.max(0, subtotal - discountVal);
  const orderNumber = "QR-" + Math.floor(100000 + Math.random() * 900000);
  
  const itemsText = items.map(i => `• ${i.name} (×${i.qty}) - ${i.price * i.qty} ${STORE_CONFIG.currency || 'ج.م'}`).join("\n");

  const order = {
    orderNumber: orderNumber,
    name: values.fName,
    phone: values.fPhone,
    whatsapp: values.fWhatsapp,
    province: values.fProvince,
    city: values.fCity,
    address: values.fAddress,
    paymentMethod: paymentMethod,
    promoCode: window._appliedPromo ? window._appliedPromo.code : null,
    discount: discountVal,
    subtotal: subtotal,
    total: finalTotal,
    notes: document.getElementById("fNotes") ? document.getElementById("fNotes").value.trim() : '',
    items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
    date: new Date().toLocaleDateString("ar-EG"),
    status: "بانتظار التأكيد",
    createdAt: Date.now()
  };

  if (typeof firebase !== 'undefined') {
    try {
      const db = firebase.firestore();
      await db.collection("orders").add(order);
      
      // خصم الكمية من المخزون تلقائياً بعد الشراء
      for (const item of order.items) {
        const pRef = await db.collection("products").where("id", "==", item.id).get();
        if (!pRef.empty) {
          const doc = pRef.docs[0];
          const currStock = parseInt(doc.data().stock) || 0;
          await db.collection("products").doc(doc.id).update({
            stock: Math.max(0, currStock - item.qty)
          });
        }
      }
    } catch (err) {
      console.error("خطأ في رفع الطلب للسحابة:", err);
    }
  }

  let savedOrders = JSON.parse(localStorage.getItem('wt_store_orders') || '[]');
  savedOrders.push(order);
  localStorage.setItem('wt_store_orders', JSON.stringify(savedOrders));

  const botToken = '8975813774:AAGEM7r1snpX5tIhckDsqQewl130GQ624Iw';
  const chatId = '5535861156';

  const promoText = window._appliedPromo ? `\n🎟️ كود الخصم: ${window._appliedPromo.code} (خصم ${discountVal} ج.م)` : '';

  const telegramMessage = `
🔔 طلب جديد من متجر WT Store!

🔖 رقم الطلب: ${orderNumber}
👤 الاسم: ${values.fName}
📞 الهاتف: ${values.fPhone}
💬 واتساب: ${values.fWhatsapp}
📍 المحافظة: ${values.fProvince}
🏙️ المدينة: ${values.fCity}
🏠 العنوان: ${values.fAddress}
💳 طريقة الدفع: ${paymentMethod}${promoText}
📝 ملاحظات: ${order.notes || 'لا يوجد'}

🛒 تفاصيل المنتجات:
${itemsText}

💰 الإجمالي النهائي: ${finalTotal} ${STORE_CONFIG.currency || 'ج.م'}
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
  
  let paymentInstructions = "";
  if (order.paymentMethod === "فودافون كاش") {
    paymentInstructions = `<div style="background:rgba(230,0,0,0.1); color:#e60000; padding:15px; border-radius:8px; margin-top:15px; border:1px solid #e60000;">
      <strong>تعليمات الدفع:</strong> برجاء تحويل مبلغ ${order.total} ج.م إلى رقم فودافون كاش الخاص بنا والتواصل معنا لتأكيد التحويل.
    </div>`;
  } else if (order.paymentMethod === "إنستا باي (InstaPay)") {
    paymentInstructions = `<div style="background:rgba(102,0,204,0.1); color:#6600cc; padding:15px; border-radius:8px; margin-top:15px; border:1px solid #6600cc;">
      <strong>تعليمات الدفع:</strong> برجاء تحويل مبلغ ${order.total} ج.م عبر إنستا باي والتواصل معنا لتأكيد التحويل.
    </div>`;
  }

  el.innerHTML = `
    <div class="container success-view">
      <div class="success-icon">🎉</div>
      <h1>تم استلام طلبك بنجاح</h1>
      <div class="success-card">
        <div class="summary-row"><span>رقم الطلب</span><span>${order.orderNumber}</span></div>
        <div class="summary-row"><span>الاسم</span><span>${order.name}</span></div>
        <div class="summary-row"><span>طريقة الدفع</span><span>${order.paymentMethod || 'الدفع عند الاستلام'}</span></div>
        <div class="summary-row"><span>الإجمالي</span><span>${order.total} ${STORE_CONFIG.currency || 'ج.م'}</span></div>
        <div class="summary-row"><span>الحالة</span><span class="status-badge">بانتظار التأكيد</span></div>
        ${paymentInstructions}
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
    if (status === "في طريقها للتوصيل") statusColor = "#10b981";
    if (status === "تم التسليم") statusColor = "#10b981";
    if (status === "ملغى") statusColor = "#ef4444";

    return `
      <div class="success-card" style="margin-bottom: 20px; text-align: right; border: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 10px;">
          <h3 style="margin: 0; color: var(--text-main);">رقم الطلب: ${order.orderNumber}</h3>
          <span style="background: rgba(0,255,102,0.1); color: ${statusColor}; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 13px;">${status}</span>
        </div>
        <div class="summary-row"><span>اسم العميل:</span><span>${order.name}</span></div>
        <div class="summary-row"><span>طريقة الدفع:</span><span><b style="color:var(--text-muted);">${order.paymentMethod || 'الدفع عند الاستلام'}</b></span></div>
        <div class="summary-row"><span>العنوان:</span><span>${order.province} - ${order.city} - ${order.address}</span></div>
        <div class="summary-row"><span>الإجمالي:</span><span style="color: #10b981; font-weight: bold;">${order.total} ${STORE_CONFIG.currency || 'ج.م'}</span></div>
        <div style="margin-top: 10px; font-size: 13px; color: var(--text-muted);">تاريخ الطلب: ${order.date}</div>
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

// ---------- النزول المباشر والسلس للأقسام - تم تصحيح مشكلة الإخفاء الإجباري هنا ----------
function scrollToSection(sectionId) {
  closeMobileMenu();
  const homeView = document.getElementById("view-home");
  
  if (homeView && !homeView.classList.contains("active")) {
    document.querySelectorAll(".view").forEach(v => {
      v.classList.remove("active");
      v.style.display = ""; // هذا السطر يحل المشكلة جذرياً
    });
    homeView.classList.add("active");
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
  initCloudProducts(); 
  
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
