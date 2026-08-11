// إعدادات الاتصال بـ Firebase السحابي
const firebaseConfig = {
  apiKey: "AIzaSyBgiUuOxa9JKG3lTonpl8uYPaJBlUSisAU",
  authDomain: "wt-store-a71af-3c9a7.firebaseapp.com",
  projectId: "wt-store-a71af-3c9a7",
  storageBucket: "wt-store-a71af-3c9a7.appspot.com",
  messagingSenderId: "500683952997",
  appId: "1:500683952997:web:f64872a5676cde173e878c"
};

// تهيئة الاتصال
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
