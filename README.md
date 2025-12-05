# ⚡ Forja

**Forja** - Plateforme de génération d'applications desktop par IA

Générez des applications Electron installables (Windows, Mac, Linux) simplement en décrivant ce que vous voulez en langage naturel.

---

## 🚀 Fonctionnalités

### Génération & Code
- ✨ **Génération par IA** - Décrivez votre app, Claude génère le code
- 💻 **Multi-plateforme** - Windows (.exe), macOS (.dmg), Linux (.AppImage)
- 🔄 **Modifications en temps réel** - Affinez votre app par conversation
- 📦 **Code complet** - Package.json, main.js, renderer, styles, tout est généré
- 🔒 **Sécurisé** - Context isolation et meilleures pratiques Electron

### Interface Utilisateur
- 🎨 **Frontend React moderne** - Interface dark mode avec Tailwind CSS
- 💬 **Chat conversationnel** - Générez et modifiez par dialogue naturel
- 👁️ **Aperçu en temps réel** - Visualisez le code généré instantanément
- 📱 **Responsive** - Fonctionne sur desktop, tablette et mobile

### Authentification & Comptes
- 🔐 **JWT Auth** - Connexion/inscription sécurisée
- 👤 **Profils utilisateurs** - Gestion de compte personnalisé
- 📂 **Projets sauvegardés** - Tous vos projets dans le cloud
- 🔄 **Auto-save** - Vos projets sont sauvegardés automatiquement

### Abonnements & Paiements
- 💳 **Stripe intégré** - Paiements sécurisés
- 📊 **Plans tarifaires** - Gratuit, Pro (15€/mois), Business (49€/mois)
- 🎁 **Plan gratuit** - 2 projets, export Windows
- ⚡ **Plans Pro/Business** - Projets illimités, toutes plateformes

### Base de Données
- 🗄️ **PostgreSQL + Prisma** - Base de données robuste
- 📈 **Dashboard utilisateur** - Statistiques et gestion de projets
- 🔍 **Historique complet** - Toutes vos conversations sauvegardées

---

## 🏗️ Architecture

```
forja/
├── backend/              # API Express.js
│   ├── server.js
│   ├── routes/
│   │   ├── api.js       # Génération IA
│   │   ├── auth.js      # Authentification
│   │   ├── projects.js  # Gestion projets
│   │   └── stripe.js    # Paiements
│   ├── services/
│   │   ├── claudeService.js
│   │   └── electronGenerator.js
│   └── prisma/          # Base de données
│       └── schema.prisma
└── frontend/            # React + Vite
    ├── src/
    │   ├── pages/       # HomePage, BuilderPage, etc.
    │   ├── components/  # Navbar, Chat, CodeEditor
    │   └── store/       # Zustand state management
    └── package.json
```

---

## 📋 Prérequis

### Backend
- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14
- **Clé API Anthropic Claude** ([obtenir ici](https://console.anthropic.com/))
- **Compte Stripe** ([créer ici](https://stripe.com))

### Frontend
- **Node.js** >= 18.0.0
- **npm** ou **yarn**

---

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/forja.git
cd forja
```

### 2. Installer les dépendances Backend

```bash
npm install
```

### 3. Configuration de la Base de Données

Créez une base PostgreSQL :

```bash
createdb forja
```

Copiez et configurez `.env` :

```bash
cp .env.example .env
```

Éditez `.env` avec vos credentials :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/forja?schema=public"

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_votre_cle
STRIPE_WEBHOOK_SECRET=whsec_votre_secret
STRIPE_PRICE_ID_PRO=price_xxxxx
STRIPE_PRICE_ID_BUSINESS=price_xxxxx

# Claude API
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 4. Migrer la Base de Données

```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

### 5. Démarrer le Backend

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

### 6. Installer et Démarrer le Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:3000`

### 7. Accéder à l'Application

Ouvrez http://localhost:3000 dans votre navigateur.

**Compte de démo :**
- Email : `demo@forja.dev`
- Mot de passe : `demo123`

---

## 🎯 Utilisation

### API Endpoints

#### 1. **POST /api/generate** - Générer une nouvelle app

```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Créer une calculatrice simple avec design moderne"
  }'
```

**Réponse:**
```json
{
  "sessionId": "uuid-xxx",
  "aiResponse": "J'ai créé une calculatrice...",
  "code": { ... },
  "files": {
    "package.json": "...",
    "main.js": "...",
    "index.html": "..."
  }
}
```

#### 2. **POST /api/modify** - Modifier l'app existante

```bash
curl -X POST http://localhost:3001/api/modify \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "uuid-xxx",
    "modification": "Ajouter un bouton pour effacer tout"
  }'
```

#### 3. **POST /api/build** - Compiler les exécutables

```bash
curl -X POST http://localhost:3001/api/build \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "uuid-xxx",
    "platforms": ["windows", "mac", "linux"]
  }'
```

#### 4. **GET /api/session/:id** - Info session

```bash
curl http://localhost:3001/api/session/uuid-xxx
```

#### 5. **DELETE /api/session/:id** - Supprimer session

```bash
curl -X DELETE http://localhost:3001/api/session/uuid-xxx
```

---

## 📁 Structure du projet

```
forja/
├── server.js                 # Serveur Express principal
├── package.json              # Dépendances
├── .env                      # Configuration (ne pas commit!)
├── .env.example              # Template de configuration
├── config/
│   └── config.js             # Configuration centralisée
├── routes/
│   └── api.js                # Routes API
├── services/
│   ├── claudeService.js      # Intégration Claude AI
│   └── electronGenerator.js  # Génération d'exécutables
├── middleware/
│   └── errorHandler.js       # Gestion des erreurs
├── templates/
│   └── basic/                # Template Electron de base
│       ├── package.json
│       ├── main.js
│       ├── preload.js
│       ├── index.html
│       ├── styles.css
│       └── renderer.js
├── temp/                     # Projets temporaires (généré)
└── generated_projects/       # Projets compilés (généré)
```

---

## 🎨 Exemples d'applications

Voici quelques exemples de ce que vous pouvez créer :

### 1. Calculatrice
```json
{
  "description": "Une calculatrice avec design moderne, boutons colorés et historique des calculs"
}
```

### 2. Gestionnaire de tâches
```json
{
  "description": "Application de gestion de tâches avec ajout, suppression, et marquage comme terminé. Stockage local."
}
```

### 3. Éditeur de notes
```json
{
  "description": "Éditeur de notes markdown avec prévisualisation en temps réel et sauvegarde automatique"
}
```

### 4. Gestion d'inventaire
```json
{
  "description": "Application de gestion d'inventaire pour une boutique : ajouter des produits, quantités, prix, recherche et filtres"
}
```

---

## 🧪 Tests

### Test de connexion à Claude

Créez un fichier `test-claude.js` :

```javascript
const claudeService = require('./services/claudeService');

async function test() {
  console.log('🧪 Test de connexion à Claude...');

  const connected = await claudeService.testConnection();

  if (connected) {
    console.log('✅ Connexion réussie!');
  } else {
    console.log('❌ Échec de connexion');
  }
}

test();
```

```bash
node test-claude.js
```

### Test de génération

```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"description": "Hello World app"}'
```

---

## 🔧 Configuration avancée

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port du serveur | 3001 |
| `NODE_ENV` | Environnement | development |
| `ANTHROPIC_API_KEY` | Clé API Claude | *requis* |
| `RATE_LIMIT_WINDOW_MS` | Fenêtre rate limiting | 900000 (15min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requêtes | 100 |
| `CORS_ORIGIN` | Origin CORS | http://localhost:3000 |
| `MAX_PROJECT_SIZE_MB` | Taille max projet | 50 |
| `TEMP_DIR` | Dossier temp | ./temp |
| `OUTPUT_DIR` | Dossier output | ./generated_projects |

### Modèle Claude

Par défaut, Forja utilise `claude-3-5-sonnet-20241022`. Pour changer :

Dans `services/claudeService.js` :

```javascript
model: 'claude-3-5-sonnet-20241022', // ou claude-3-opus-20240229
```

---

## 🚧 Limitations actuelles

- **Build local uniquement** - Les exécutables sont générés localement (pas de cloud)
- **Pas de BDD** - Sessions en mémoire (perdu au redémarrage)
- **Pas d'auth** - Pas de système d'authentification
- **Build lent** - Compilation Electron peut prendre 5-10 min
- **Coût API** - Chaque génération coûte ~$0.05-0.20 selon la complexité

---

## 🛣️ Roadmap

### Phase 1 (MVP) ✅
- [x] API backend Express
- [x] Intégration Claude
- [x] Génération de code Electron
- [x] Build multi-plateformes
- [x] Templates de base

### Phase 2 (En cours)
- [ ] Interface frontend React
- [ ] Authentification utilisateurs
- [ ] Base de données PostgreSQL
- [ ] Paiements Stripe
- [ ] Upload vers S3/CDN

### Phase 3 (Futur)
- [ ] Dashboard utilisateur
- [ ] Templates prédéfinis
- [ ] Marketplace d'apps
- [ ] Branding personnalisé
- [ ] Support Tauri (alternative à Electron)

---

## 💰 Monétisation (Modèle proposé)

| Plan | Prix | Fonctionnalités |
|------|------|-----------------|
| **Gratuit** | 0$ | 2 projets, export Windows uniquement |
| **Pro** | 15$/mois | Projets illimités, Windows + Mac + Linux |
| **Business** | 49$/mois | Tout + branding personnalisé + support |

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 Licence

MIT License - voir [LICENSE](LICENSE) pour plus de détails

---

## 🙏 Remerciements

- **Anthropic** pour Claude AI
- **Electron** pour le framework desktop
- **Communauté open-source**

---

## 📧 Contact

- **Site web**: [forja.dev](https://forja.dev) *(à venir)*
- **Email**: hello@forja.dev
- **Twitter**: [@forja_dev](https://twitter.com/forja_dev) *(à venir)*

---

## ⚠️ Notes de développement

### Pour démarrer en mode développement

```bash
npm run dev
```

### Pour tester le template de base

```bash
cd templates/basic
npm install
npm start
```

### Pour nettoyer les fichiers temporaires

```bash
rm -rf temp/* generated_projects/*
```

---

**Fait avec ❤️ par l'équipe Forja**
