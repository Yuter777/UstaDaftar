# Usta Daftar

Qurilish ustalari/brigadirlari uchun CRM veb-ilova (brigada.app uslubida, to'q tema, o'zbek tilida).
React 18 + Vite + Tailwind + Supabase + PWA.

## Ishga tushirish

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

`.env` fayli (allaqachon to'ldirilgan):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...   # publishable / anon kalit
```

## Sahifalar

| Marshrut | Ekran |
|---|---|
| `/login` | Telefon + SMS OTP kirish |
| `/` | ⭐ Timeline — brigadalar taqvimi (to'qnashuv ogohlantirishi bilan) |
| `/obyektlar` | Voronka — obyektlar ro'yxati, status filtri, qidiruv |
| `/obyektlar/:id` | Obyekt kartochkasi (moliya bloki, qo'ng'iroq, xarita, to'lov) |
| `/obyektlar/:id/smeta` | Smeta — ishlar/materiallar, avto-hisob, Excel eksport |
| `/brigadalar` | Brigadalar + a'zolar (rang tanlash) |
| `/davomat` | ⭐ Davomat matritsasi (✅ ½ ❌), Excel eksport |
| `/tolovlar` | Ishchilarga to'lovlar (avans/oylik), Excel eksport |
| `/katalog` | Ishlar / materiallar / xarajatlar katalogi |

## Backend talablari (Supabase)

Ilova quyidagi jadvallarni kutadi: `ustalar`, `brigadalar`, `ishchilar`, `obyektlar`,
`smeta`, `katalog`, `davomat`, `tolovlar` (prompt'dagi struktura bo'yicha).

**Muhim:** Telefon OTP ishlashi uchun Supabase loyihasida **SMS provayder** (Twilio, Vonage va h.k.)
**Authentication → Providers → Phone** bo'limida yoqilgan bo'lishi shart. Aks holda kod yuborilmaydi.

RLS yoqilgan bo'lsa, har bir jadvalda joriy usta o'z yozuvlarini ko'ra/qo'sha olishi uchun
siyosatlar sozlanishi kerak. Ilova insertlarda `usta_id` ni avtomatik to'ldiradi (`ustalar`
jadvalidagi joriy yozuvdan).
# UstaDaftar
