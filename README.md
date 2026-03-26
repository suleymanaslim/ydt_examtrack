# YDT Takip — Kurulum ve Kullanım Kılavuzu

## Gereksinimler

- **Node.js** (v18+)

> Uygulama tamamen frontend'de çalışır.

---

## Kurulum

```bash
cd frontend
npm install
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır.

---

## Kullanım

### Öğrenci — Şifresiz
1. Ana sayfada "(Öğrenci)" butonuna tıklayın
2. Sınav tarihini seçin, her konu için doğru/yanlış sayısını girin
3. "Sonucu Göster" butonuna tıklayın
4. Ekrandaki **sonuç kartı**nın ekran görüntüsünü alabilir veya **JSON Kopyala** butonuyla veriyi kopyalayıp öğretmene gönderebilirsiniz

### Öğretmen (Süleyman) — Şifre: `ogretmen123`
1. "Süleyman (Öğretmen)" butonuna tıklayın, şifre girin
2. "Sınav Ekle" → öğrenciden gelen JSON'ı yapıştırın → "Ekle"
3. Tüm sınavlar listede görünür, detay açılabilir, silinebilir
4. **Gelişim** sekmesi: istatistik kartları + net puan grafiği

> Veriler tarayıcının localStorage'ında saklanır. Tarayıcı verilerini temizlerseniz silinir.

---

## Şifre Değiştirme

`frontend/.env` dosyasındaki `VITE_TEACHER_PASSWORD` değerini değiştirin.
