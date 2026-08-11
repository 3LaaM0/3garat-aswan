// ============================================
// إدارة السلة (localStorage)
// ============================================
const Cart = {
  KEY: "wtstore_cart",

  getItems() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
    Cart.updateCounter();
  },

  add(productId, qty = 1) {
    const items = this.getItems();
    const existing = items.find(i => i.id === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ id: productId, qty });
    }
    this.save(items);
  },

  remove(productId) {
    let items = this.getItems();
    items = items.filter(i => i.id !== productId);
    this.save(items);
  },

  setQty(productId, qty) {
    const items = this.getItems();
    const item = items.find(i => i.id === productId);
    if (item) {
      item.qty = Math.max(1, qty);
      this.save(items);
    }
  },

  increase(productId) {
    const items = this.getItems();
    const item = items.find(i => i.id === productId);
    if (item) { item.qty += 1; this.save(items); }
  },

  decrease(productId) {
    const items = this.getItems();
    const item = items.find(i => i.id === productId);
    if (item) {
      item.qty -= 1;
      if (item.qty <= 0) {
        this.remove(productId);
        return;
      }
      this.save(items);
    }
  },

  clear() {
    localStorage.removeItem(this.KEY);
    Cart.updateCounter();
  },

  count() {
    return this.getItems().reduce((sum, i) => sum + i.qty, 0);
  },

  detailedItems() {
    // جلب المنتجات المتاحة من الدالة الموحدة أو المتغير
    const productsList = typeof getActiveProducts === 'function' ? getActiveProducts() : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
    
    return this.getItems().map(i => {
      const product = productsList.find(p => p.id === i.id);
      return product ? { ...product, qty: i.qty } : null;
    }).filter(Boolean);
  },

  subtotal() {
    return this.detailedItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  total() {
    return this.subtotal(); // لا توجد رسوم شحن حالياً - يمكن إضافتها هنا لاحقاً
  },

  updateCounter() {
    const el = document.getElementById("cartCount");
    if (el) {
      const c = Cart.count();
      el.textContent = c;
      el.style.display = c > 0 ? "flex" : "none";
    }
  }
};
