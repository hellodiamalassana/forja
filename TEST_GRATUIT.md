# 🧪 Tester Forja Gratuitement

Plusieurs options pour tester Forja sans payer.

---

## ⚡ Option 1 : En Local (100% Gratuit, 5 min)

**La plus simple et rapide !**

### Prérequis
- Node.js 18+
- PostgreSQL 14+ (ou Docker)

### Installation

```bash
# 1. Clone le projet
git clone https://github.com/K-ETA-COMPANY/forja.git
cd forja

# 2. Backend - Installation
npm install

# 3. PostgreSQL avec Docker (si tu n'as pas PostgreSQL)
docker run --name forja-postgres -e POSTGRES_PASSWORD=forja123 -e POSTGRES_DB=forja -p 5432:5432 -d postgres:14

# 4. Configuration
cp .env.example .env
```

**Édite `.env` avec le minimum :**
```env
DATABASE_URL="postgresql://postgres:forja123@localhost:5432/forja"
JWT_SECRET=test_secret_key_local_only
ANTHROPIC_API_KEY=sk-ant-ta_cle_claude
CORS_ORIGIN=http://localhost:3000
```

```bash
# 5. Migrations et seed
npx prisma migrate dev
npx prisma generate
npm run db:seed

# 6. Lance le backend
npm run dev
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm install
npm run dev
```

**✅ Accès :**
- Frontend : http://localhost:3000
- API : http://localhost:3001
- Admin : admin@forja.dev / admin123

---

## 🌐 Option 2 : Railway (Gratuit 500h/mois)

**Hébergement cloud gratuit avec PostgreSQL inclus**

### Étapes

1. **Compte Railway** : https://railway.app (gratuit avec GitHub)

2. **New Project** → Deploy from GitHub
   - Sélectionne : K-ETA-COMPANY/forja
   - Railway détecte automatiquement

3. **Ajoute PostgreSQL** :
   - Add Service → Database → PostgreSQL
   - Railway créé automatiquement `DATABASE_URL`

4. **Configure variables** :
   ```
   JWT_SECRET=ton_secret_jwt
   ANTHROPIC_API_KEY=sk-ant-...
   STRIPE_SECRET_KEY=sk_test_... (optionnel)
   CORS_ORIGIN=https://ton-app.railway.app
   ```

5. **Deploy** → Railway déploie automatiquement !

**URL auto-générée :** `https://forja-production.up.railway.app`

**Limites gratuites :**
- 500h/mois d'exécution
- 1GB RAM
- 1GB stockage DB
- Parfait pour tester !

---

## 🚀 Option 3 : Render (Gratuit avec limites)

**Alternative à Railway**

### Étapes

1. **Compte Render** : https://render.com (gratuit)

2. **New** → Web Service
   - Connect repository : K-ETA-COMPANY/forja
   - Name : forja-backend
   - Environment : Docker
   - Plan : Free

3. **Ajoute PostgreSQL** :
   - New → PostgreSQL
   - Name : forja-db
   - Plan : Free
   - Copie l'URL de connexion interne

4. **Variables** (dans le Web Service) :
   ```
   DATABASE_URL=<url-postgres-interne>
   JWT_SECRET=secret123
   ANTHROPIC_API_KEY=sk-ant-...
   ```

5. **Deploy** !

**Limites gratuites :**
- Service se met en veille après 15min d'inactivité
- Redémarre en ~30s au premier accès
- 750h/mois
- Parfait pour démo/test !

---

## ☁️ Option 4 : Vercel (Frontend) + Supabase (Backend)

**Frontend gratuit, Backend avec Supabase**

### Frontend sur Vercel

```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

Suivi des prompts → App déployée !

### Backend avec Supabase

1. **Supabase** : https://supabase.com (gratuit)
2. New Project → PostgreSQL créé automatiquement
3. Copie la `DATABASE_URL`
4. Déploie backend sur Render ou Railway

---

## 💡 Option 5 : GitHub Codespaces (Cloud IDE)

**Teste directement dans le navigateur sans installer**

1. Va sur : https://github.com/K-ETA-COMPANY/forja
2. Click **Code** → **Codespaces** → **New codespace**
3. Un VS Code s'ouvre dans le navigateur !

```bash
# Dans le terminal Codespace
npm install
cp .env.example .env
# Édite .env avec nano

# Lance PostgreSQL
docker run --name postgres -e POSTGRES_PASSWORD=test -p 5432:5432 -d postgres:14

# Migrations
npx prisma migrate dev
npm run db:seed

# Lance l'app
npm run dev &
cd frontend && npm install && npm run dev
```

Codespaces rend les ports accessibles publiquement !

**Gratuit :** 60h/mois

---

## 🎯 Recommandation

### Pour tester rapidement (5 min) :
→ **Option 1 : En Local**

### Pour montrer à quelqu'un (URL publique) :
→ **Option 2 : Railway** (le plus simple)

### Pour démo longue durée :
→ **Option 3 : Render**

---

## 📊 Comparaison

| Service | Gratuit | DB Inclus | SSL | Sleep? | Limite |
|---------|---------|-----------|-----|--------|--------|
| **Local** | ✅ 100% | ❌ | ❌ | ❌ | ∞ |
| **Railway** | ✅ | ✅ | ✅ | ❌ | 500h/mois |
| **Render** | ✅ | ✅ | ✅ | ✅ 15min | 750h/mois |
| **Vercel** | ✅ | ❌ | ✅ | ❌ | ∞ (frontend) |
| **Codespaces** | ✅ | Via Docker | ✅ | ❌ | 60h/mois |

---

## 🚀 Après les Tests

Quand tu es satisfait :
1. Déploie sur ton VPS avec **Coolify** (guide complet disponible)
2. Configure Stripe en mode LIVE
3. Lance en production !

---

## 🆘 Aide

### Test en local ne fonctionne pas ?

**PostgreSQL connection error :**
```bash
# Vérifie que PostgreSQL tourne
docker ps

# Ou installe PostgreSQL directement
# Mac: brew install postgresql@14
# Ubuntu: apt install postgresql
```

**Port 3000 déjà utilisé :**
```bash
# Change dans frontend/vite.config.js
server: { port: 3002 }
```

**Clé Claude invalide :**
- Vérifie sur https://console.anthropic.com
- Crée une nouvelle clé si nécessaire

---

**Choisis ton option et teste Forja maintenant ! 🚀**
