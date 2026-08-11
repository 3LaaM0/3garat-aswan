// جلب المنتجات المحدثة من لوحة التحكم أو استخدام الافتراضية لأول مرة فقط
const savedProducts = localStorage.getItem('wt_custom_products');

var PRODUCTS = savedProducts ? JSON.parse(savedProducts) : [
  { id: 1, name: "سماعة JBL اللاسلكية", price: 1450, oldPrice: 1750, image: "assets/products/headphone.svg", shortDesc: "صوت نقي وباس قوي مع عزل ضوضاء", description: "سماعة رأس لاسلكية بتقنية بلوتوث 5.3.", specs: ["بلوتوث 5.3", "بطارية 40 ساعة"] },
  { id: 2, name: "ساعة ذكية رياضية", price: 990, oldPrice: 1250, image: "assets/products/watch.svg", shortDesc: "تتبع اللياقة والصحة بشاشة AMOLED", description: "ساعة ذكية مقاومة للماء.", specs: ["شاشة AMOLED", "IP68"] },
  { id: 3, name: "سماعات أذن لاسلكية", price: 650, oldPrice: 850, image: "assets/products/earbuds.svg", shortDesc: "خفيفة ومريحة مع علبة شحن", description: "سماعات أذن لاسلكية صغيرة الحجم.", specs: ["بلوتوث 5.2", "تحكم باللمس"] },
  { id: 4, name: "مكبر صوت بلوتوث محمول", price: 780, oldPrice: 980, image: "assets/products/speaker.svg", shortDesc: "صوت قوي 360 درجة مناسب للرحلات", description: "مكبر صوت محمول مقاوم للماء.", specs: ["بلوتوث 5.0", "صوت 360 درجة"]
];

if (!savedProducts) {
  localStorage.setItem('wt_custom_products', JSON.stringify(PRODUCTS));
}
