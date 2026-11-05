# 🌟 Alifbe.uz - O'zbek Alifbosi Mobil O'quv Web Ilovasi

Bolalar va yangi boshlovchilar uchun o'zbek alifbosini **0 dan mukammal o'rganish** uchun yaratilgan zamonaviy, rang-barang va interaktiv mobil web platforma.

---

## 📱 Asosiy Imkoniyatlar va Qulayliklar

### 1. 📖 Alifbo Bog'i (Interaktiv Harflar Xaritasi)
- **To'liq 29 ta harf** va harflar birikmasi (A-Z, Oʻ, Gʻ, Sh, Ch, Ng) hamda Tutuq belgisi (’);
- **Unli (6 ta)** va **Undosh (23 ta)** tovushlar ranglar bilan aniq ajratilgan;
- Har bir harf uchun:
  - Bosh va kichik yozilishi (`Aa`, `Gʻgʻ`, `Sh sh`);
  - Tasviriy timsol (masalan: `Olma 🍎`, `Baliq 🐟`, `Daraxt 🌳`, `Gʻoz 🪿`, `Choynak 🫖`);
  - Tovush xarakteristikasi (jarangli, jarangsiz, lablangan unli va h.k.);
  - Qo'shimcha misol so'zlar va ularning talaffuzi;
  - Harfni tinglash va to'g'ridan-to'g'ri qalamda chizib ko'rish imkoniyati.

---

### 2. 🎮 3 Ta Qiziqarli va O'rgatuvchi O'yin

#### 🎯 1. "Harfni Top!" (Viktorina)
- Bolalarning eshitish va ko'rish xotirasini charxlaydi;
- Savol turlari:
  - *"Qaysi biri 'B' harfi?"* (Tovush orqali topish);
  - *"'Olma' so'zi qaysi harfdan boshlanadi?"* (Rasm orqali bosh harfni topish);
  - Ketma-ket to'g'ri topishlar (Streak 🔥) va bayramona konfetti effekti.

#### 🧩 2. "Juftini Top" (Memory Match)
- 3D animatsiyali kartalar;
- Harf bilan unga mos rasm/so'z juftligini topish (masalan, `K` ↔ `Kitob 📖`);
- Harakatlar hisoblagichi va xotirani mustahkamlash.

#### 🔤 3. "So'z Terish" (Word Builder)
- Rasmdagi so'zni aralashtirilgan harflardan terish (masalan: `B A L I Q`);
- Harflar bo'g'in va so'zga qanday ulanishini tushuntiradi;
- Xato bo'lganda yumshoq ogohlantirish, to'g'ri bo'lganda quvnoq musiqa va yulduzlar!

---

### 3. ✍️ Sehrli Qalam (Husnixat va Chizish Mashqi)
- Touch / Barmoq orqali chizishga to'liq moslashtirilgan;
- Har bir harfning katta shablon chizig'i (Dashed guide);
- Ranglar palitrasi (Binafsha, Pushti, Zumrad yashil, Oltin sariq);
- Bolalarni maqtovchi *"Ofarin!"* bayram tugmasi.

---

### 4. 🏆 Mukofotlar, Yulduzlar va Nishonlar (Gamification)
- To'plangan yulduzlar (⭐️) hisobi;
- Darajalar:
  - `🌱 Boshlovchi`
  - `🌿 Qiziquvchan`
  - `⭐ Bilimdon`
  - `🎖️ Alifbo Ustasi`
  - `👑 Zukko Olim`
- Maxsus nishonlar: *"Ilk Qadam"*, *"Unlilar Donosi"*, *"Mergan Zehn"*, *"Zukko Xotira"*, *"So'z Ustasi"*, *"Sehrli Mo'yqalam"*, *"Alifbo Qahramoni"*.
- Barcha natijalar telefon xotirasida (`localStorage`) saqlanib qoladi.

---

## 🎨 Dizayn Ustunliklari (Mobile-First UX)
- **Haqiqiy mobil ilova hissi**: Pastki qulay navigatsiya (Bottom Navigation Bar);
- **Glassmorphism va jonli ranglar**: Bolalarning ko'zini charchatmaydigan, energiya beruvchi palitra;
- **Tezkor audio generatori (Web Audio API)**: Hech qanday tashqi og'ir fayllarsiz, to'liq oflayn ovoz effektlari (pop, arpeggio, tabrik fanfari, xato signali);
- **Ovozli talaffuz (Web Speech API)**: Harflar va so'zlarni jarangdor talaffuz qilish;
- **Tun/Kun rejimi (Dark/Light mode)** va Ovozni o'chirish/yoqish imkoniyati.

---

## 🚀 Qanday Ishga Tushirish Mumkin?

Ilova hech qanday murakkab kutubxonalarga yoki o'rnatishlarga muhtoj emas. 

### 1-usul: Oddiy ochish
1. Papkadagi `index.html` faylini istalgan brauzerda (Chrome, Safari, Edge, Samsung Internet) oching.
2. Mobil rejimda ko'rish uchun: F12 tugmasini bosing va qurilma rejimiga (`Ctrl + Shift + M`) o'ting yoki to'g'ridan-to'g'ri telefoningizda oching.

### 2-usul: Telefonda ochish (Lokal Wi-Fi orqali)
1. Ushbu papkada terminal ochib quyidagini tering:
   ```bash
   npx serve -l 3000
   # yoki
   python -m http.server 3000
   ```
2. Telefoningiz brauzerida kompyuteringiz lokal IP manzilini kiriting (masalan, `http://192.168.1.5:3000`).
3. Brauzer menyusidan *"Bosh ekranga qo'shish"* (Add to Home screen) tugmasini bossangiz, u telefonda alohida mobil ilovadek ishlaydi!

