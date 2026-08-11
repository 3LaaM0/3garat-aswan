// كود إرسال الطلب من موقع WT Store مباشرة إلى تليجرام
document.addEventListener('DOMContentLoaded', () => {
    const checkoutButton = document.querySelector('button, .checkout-btn'); // زر تأكيد الطلب

    if (checkoutButton) {
        checkoutButton.addEventListener('click', async function (e) {
            e.preventDefault(); // منع إعادة تحميل الصفحة

            // 1. جلب البيانات من الحقول الموجودة في الصفحة عندك
            const fullName = document.querySelector('input[placeholder*="أحمد محمد"]')?.value || '';
            const phone = document.querySelector('input[placeholder="01xxxxxxxxxx"]')?.value || '';
            const whatsappInputs = document.querySelectorAll('input[placeholder="01xxxxxxxxxx"]');
            const whatsapp = whatsappInputs.length > 1 ? whatsappInputs[1].value : phone;
            const city = document.querySelector('input[placeholder*="القاهرة"]')?.value || '';
            const address = document.querySelector('textarea[placeholder*="اسم الشارع"]')?.value || '';
            const notes = document.querySelector('textarea[placeholder*="أي تفاصيل إضافية"]')?.value || '';

            // 2. بيانات البوت الخاص بك (ضع بياناتك هنا)
            const botToken = '8975813774:AAGEM7r1snpX5tIhckDsqQewl130GQ624Iw'; 
            const chatId = '5535861156'; 

            // 3. تنسيق رسالة التليجرام
            const message = `
🔔 طلب جديد من متجر WT Store!

👤 الاسم: ${fullName}
📞 الهاتف: ${phone}
💬 واتساب: ${whatsapp}
📍 المحافظة / المدينة: ${city}
🏠 العنوان: ${address}
📝 ملاحظات: ${notes || 'لا يوجد'}
            `.trim();

            // 4. إرسال الطلب لـ Telegram API
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
                    alert('تم تأكيد طلبك بنجاح! سيتم التواصل معك قريباً.');
                    // ممكن تفريغ السلة أو إعادة توجيه الصفحة هنا لو تحب
                } else {
                    alert('حدث خطأ أثناء إرسال الطلب، تأكد من البيانات.');
                }
            } catch (error) {
                console.error('خطأ في الاتصال:', error);
                alert('فشل الاتصال، تحقق من شبكة الإنترنت.');
            }
        });
    }
});
