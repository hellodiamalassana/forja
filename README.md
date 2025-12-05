# ⚡ Forja

**Forja** - Plateforme de génération d'applications desktop par IA

Générez des applications Electron installables (Windows, Mac, Linux) simplement en décrivant ce que vous voulez en langage naturel.

---

## 🚀 Fonctionnalités

- ✨ **Génération par IA** - Décrivez votre app, Claude génère le code
- 💻 **Multi-plateforme** - Windows (.exe), macOS (.dmg), Linux (.AppImage)
- 🎨 **Interface moderne** - Design responsive et élégant
- 🔄 **Modifications en temps réel** - Affinez votre app par conversation
- 📦 **Code complet** - Package.json, main.js, renderer, styles, tout est généré
- 🔒 **Sécurisé** - Context isolation et meilleures pratiques Electron

---

## 📋 Prérequis

- **Node.js** >= 18.0.0
- **npm** ou **yarn**
- **Clé API Anthropic Claude** ([obtenir ici](https://console.anthropic.com/))

---

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/forja.git
cd forja
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

Copiez `.env.example` vers `.env` et ajoutez votre clé API :

```bash
cp .env.example .env
```

Éditez `.env` :

```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
PORT=3001
NODE_ENV=development
```

### 4. Démarrer le serveur

```bash
npm start
```

Le serveur démarre sur `http://localhost:3001`

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
