# YDT Takip Sistemi

YDT (Yabancı Dil Testi) öğretmenleri ve öğrencileri için geliştirilmiş, yerel öncelikli (local-first) ve basit bir sınav takip sistemidir.

## Özellikler

- **Öğrenci Paneli**: Öğrencilerin kolayca sınav sonuçlarını girebileceği adım adım sihirbaz arayüzü.
- **JSON Transferi**: Veritabanı kurulumu gerektirmeyen, öğrencinin ürettiği JSON kodunu öğretmene (WhatsApp vb. üzerinden) göndermesiyle çalışan basit veri aktarımı.
- **Öğretmen Paneli**: Gelen JSON verilerini içe aktararak öğrenci gelişimini takip etme.
- **Görsel İstatistikler**: Konu bazlı başarı oranları, net gelişim grafiği (özel SVG çizim) ve dikkat edilmesi gereken konular.
- **Modern Tasarım**: Tailwind CSS ve Framer Motion ile güçlendirilmiş, karanlık tema destekli premium kullanıcı deneyimi.

## Teknolojiler

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React (İkonlar)
- Dexie.js (Yerel veritabanı - IndexedDB)

## Kurulum

```bash
cd frontend
npm install
npm run dev
```

Bu sistem, herhangi bir cloud veritabanı kurulumu gerektirmeden, verileri kullanıcının kendi tarayıcısında (IndexedDB) güvenli ve hızlı bir şekilde saklar.
