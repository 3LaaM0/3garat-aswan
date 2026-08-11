document.addEventListener('DOMContentLoaded', () => {
    const checkoutButton = document.querySelector('button, .checkout-btn'); // زر تأكيد الطلب

    if (checkoutButton) {
        checkoutButton.addEventListener('click', async function (e) {
            e.preventDefault(); // منع إعادة تحميل الصفحة

            // 1. جلب البيانات من الحقول الموجودة في الصفحة
            const fullName = document.querySelector('input[placeholder*="أحمد محمد"]')?.value || document.querySelector('input[id*="name"]')?.value || 'غير محدد';
            const phone = document.querySelector('input[placeholder="01xxxxxxxxxx"]')?.value || 'غير محدد';
            
            // جلب بقية البيانات الموجودة عندك في الصفحة
            const city = document.querySelector('input[placeholder*="القاهرة"]')?.value || 'غير محددة';
            const address = document.querySelector('textarea[placeholder*="اسم الشارع"]')?.value || 'غير محدد';
            const notes = document.querySelector('textarea[placeholder*="أي تفاصيل إضافية"]')?.value || 'لا يوجد';

            // 2. بيانات بوت التليجرام الخاص بك
            const botToken = '8975813774:AAGEM7r1snpX5tIhckDsqQewl130GQ624Iw'; 
            const chatId = '5535861156'; 

            // 3. تنسيق نص الرسالة بشكل جميل ونظيف (بدون مشاكل ترميز)
            const message = 
`🔔 طلب جديد من متجر WT Store!

👤 الاسم: ${fullName}
📞 الهاتف: ${phone}
📍 المحافظة / المدينة: ${city}
🏠 العنوان: ${address}
📝 ملاحظات: ${notes}`;

            // 4. إرسال الطلب لسيرفرات تليجرام مباشرة
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: message,
                        parse_mode: 'HTML'
                    })
                });

                const data = await response.json();
                if (data.ok) {
                    alert('تم تأكيد طلبك بنجاح! وتبيانات الطلب وصلت على التليجرام.');
                    // لو حابب تحوله لصفحة النجاح بعد الإرسال
                    // window.location.href = 'success.html';
                } else {
                    alert('حدث خطأ أثناء إرسال الطلب، تأكد من الاتصال بالإنترنت.');
                }
            } catch (error) {
                console.error('خطأ في الاتصال:', error);
                alert('فشل الاتصال بالخادم.');
            }
        });
    }
});
