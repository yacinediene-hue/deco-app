# DecoApp

Application d'aide à la décoration d'intérieur. L'utilisateur photographie sa pièce, ajoute un meuble principal, et l'app propose des accessoires cohérents (tapis, rideaux, coussins, luminaire…) avec un rendu visuel.

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Backend | Next.js API Routes |
| Base de données | PostgreSQL + Prisma ORM |
| Authentification | NextAuth.js v5 |
| Stockage images | Cloudinary |
| Détourage | Remove.bg API |
| Composition IA | Sharp (local MVP) · Replicate Flux-dev-inpainting (prod) |

---

## Prérequis

- Node.js 20+
- PostgreSQL 14+ (local ou Docker)

---

## Installation

```bash
git clone https://github.com/yacinediene-hue/deco-app.git
cd deco-app
npm install
```

### Variables d'environnement

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL |
| `NEXTAUTH_SECRET` | Secret JWT (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL app (`http://localhost:3000` en dev) |
| `REMOVE_BG_API_KEY` | Clé [remove.bg](https://www.remove.bg/api) |
| `REPLICATE_API_TOKEN` | Token [Replicate](https://replicate.com) |
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud Cloudinary |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary |
| `CLOUDINARY_API_SECRET` | Secret Cloudinary |

---

## Base de données

### Docker

```bash
docker compose up -d
```

### PostgreSQL local

```bash
createuser decoapp --pwprompt   # mot de passe : decoapp_secret
createdb decoapp_db --owner decoapp
```

### Migrations & seed

```bash
npx prisma migrate dev    # applique les migrations
npx prisma db seed        # seed règles + catalogue
npx prisma studio         # interface visuelle → localhost:5555
```

---

## Lancer le projet

```bash
npm run dev     # → http://localhost:3000
npm run build
npm start
```

---

## Tests

```bash
npm test              # 113 tests unitaires
npm run test:watch
npm run test:coverage
```

Couvrent le `RecommendationEngine` : 6 styles × 3 budgets × 6 couleurs.

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                     # Étape 1 : upload photo pièce
│   ├── setup/furniture/page.tsx     # Étape 2 : meuble + couleur + dimensions
│   ├── setup/style/page.tsx         # Étape 3 : style + budget
│   ├── results/page.tsx             # Étape 4 : recommandations + rendus
│   └── api/
│       ├── recommendations/         # POST moteur de règles
│       └── image/
│           ├── compose/             # POST meuble dans la pièce
│           ├── remove-bg/           # POST détourage
│           ├── rug/                 # POST tapis perspectif
│           ├── wallpaper/           # POST couleur / motif mur
│           ├── curtain/             # POST rideaux 4 presets
│           ├── cushion/             # POST coussins
│           └── lighting/            # POST luminaire
├── lib/
│   ├── prisma.ts                    # Client Prisma singleton
│   ├── recommendation-engine.ts     # Moteur déterministe (cœur métier)
│   ├── dimensions.ts                # Placement depuis largeur réelle
│   └── image/                       # Services image (interfaces + implémentations)
├── types/recommendation.ts          # Types TypeScript métier
└── contexts/toast.tsx               # Notifications
```

---

## Règles de recommandation

Les associations sont **déterministes** (pas d'IA générative pour les règles) :

- **Couleur** : 6 couleurs × 4 types d'accessoires → table `color_rules`
- **Style** : 6 styles (moderne, chic, minimaliste, africain, bohème, luxe) → `style_rules`
- **Budget** : 3 niveaux FCFA (bas / moyen / élevé) → `budget_tiers`

Toutes éditables en base de données, sans redéploiement.

---

## Passer à Replicate (inpainting IA)

Dans [src/lib/image/composition-service.ts](src/lib/image/composition-service.ts) :

```ts
// Remplacer SharpComposer par ReplicateComposer
import { ReplicateComposer } from "./replicate-composer";
```

Puis définir `REPLICATE_API_TOKEN` dans `.env.local`.

---

## Roadmap V2

- [ ] Auth utilisateur (NextAuth déjà câblé, tables Prisma prêtes)
- [ ] Historique des simulations
- [ ] Scan AR via Apple RoomPlan
- [ ] Catalogue avec liens d'achat
- [ ] Export PDF de la simulation
