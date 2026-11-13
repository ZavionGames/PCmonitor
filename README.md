# PCMonitor Web Paneli

Kişisel bilgisayar izleme paneli. Auth yok, API yok — panel doğrudan Firestore'dan okur.

```
Python Agent → Firestore (doğrudan REST) → Web Paneli (doğrudan okuma)
```

Agent her PC'de başladığında makine bilgisini ve giriş kaydını Firestore'a yazar. Panel bu veriyi canlı olarak gösterir.

---

## Teknoloji

- **Next.js 14** (App Router) — statik sayfalar
- **TypeScript** (strict) + **Tailwind CSS** (koyu tema)
- **firebase** (istemci SDK) — Firestore okuma/yazma, `onSnapshot` ile canlı dinleme
- **recharts** — grafikler · **lucide-react** — ikonlar

Auth yok. API route'ları yok. Sadece istemci tarafı Firestore okuma/yazma.

---

## Kurulum (Yerel — opsiyonel)

Node.js 18+ gerekir (yerelde çalıştırmak isterseniz):

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Dağıtım (Vercel — önerilen)

1. Kodu GitHub'a push layın (bkz. `scripts/upload_to_github.py`)
2. Vercel → Import Project → depoyu seç
3. Environment Variables ekle (`.env.example`'den kopyala)
4. Deploy

---

## Firebase Konsolu Ayarları

### 1. Authentication
Gerekmez — auth kullanılmıyor.

### 2. Firestore Rules
- Firebase Console → Firestore → Rules sekmesi
- `firestore.rules` içeriğini yapıştırın → Publish

### 3. Indeksler
- Firebase Console → Firestore → Indexes
- `firestore.indexes.json` içeriğini içe aktarın

---

## Ortam Değişkenleri

### .env.local / Vercel

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBR1HtV434xMLnovDX26cTQNAWq259OKdw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pcmonitors.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pcmonitors
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pcmonitors.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=428312515694
NEXT_PUBLIC_FIREBASE_APP_ID=1:428312515694:web:bc810e8420d9885876027f
```

Sunucu tarafı değişken gerekmez (Admin SDK kullanılmıyor).

---

## Test

Agent'ı bir PC'de çalıştırın:

```powershell
cd pcmonitor-agent
python -m pcmonitor --test
```

Bu, makine bilgisini Firestore'a yazar. Panelde makine seçicide görünür.

İlk kurulumda etiket ayarlayın:

```powershell
python -m pcmonitor --set-label "PC 1"
```

---

## Proje Yapısı

```
├── app/
│   ├── layout.tsx  globals.css
│   ├── (panel)/
│   │   ├── layout.tsx             # makine seçici, navigasyon (auth yok)
│   │   ├── dashboard/              # durum, son başlatma, girişler
│   │   ├── activities/             # canlı zaman çizelgesi
│   │   ├── applications/           # uygulama tablosu
│   │   ├── history/                # sistem olayları
│   │   ├── statistics/             # grafikler
│   │   └── settings/                # makine adı, takip ayarları
├── components/                     # StatusBadge, MachineSelector, StatCard, EventTimeline, Toast
├── hooks/                          # useMachines, useMachineState, useEvents, useDailyStats
├── lib/                            # firebaseClient, time, format
├── types/index.ts
├── scripts/
│   ├── simulate_agent.py          # test betiği
│   └── upload_to_github.py        # GitHub'a push betiği
├── firestore.rules
├── firestore.indexes.json
└── vercel.json
```

---

## Firestore Veri Yapısı

```
machines/{machineGuid}                     # Agent yazar
    machineGuid, computerName, username, label, lastSeenUtc

machines/{machineGuid}/logins/{id}         # Agent yazar
    event, machineGuid, username, computerName,
    osVersion, agentVersion, startedAtUtc, startedAtLocal

machines/{machineGuid}/settings/current    # Panel yazar
    displayName, trackedApps, ignoredApps,
    trackSystemEvents, heartbeatIntervalSeconds, configVersion

machines/{machineGuid}/events/{eventId}    # (ileride API veya Agent yazacak)
machines/{machineGuid}/state/current       # (ileride API veya Agent yazacak)
machines/{machineGuid}/dailyStats/{date}   # (ileride API veya Agent yazacak)
machines/{machineGuid}/appStats/{appKey}   # (ileride API veya Agent yazacak)
```

Agent şu an `machines/{id}` ve `logins` yazıyor. Diğer alt dokümanlar (events, appStats vb.) için Agent'ın API'ye olay göndermesi veya doğrudan Firestore'a yazması gerekir — bu ileride eklenecek. Panel bu veriler olmadığında boş durum gösterir.

---

## Kota

- Firestore Spark: günlük 50K okuma / 20K yazma
- Vercel Hobby: aylık ~100K çağrı
- Panel `onSnapshot` ile sınırlı sorgular kullanır (limit 50, sayfalı)
- Auth olmadığı için Firestore'a doğrudan erişim var — URL'i sadece siz bilin
