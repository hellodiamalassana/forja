# ⚡ Démarrage Rapide - Forja

Guide en 5 minutes pour lancer Forja en local.

---

## 📦 Installation Express

### 1. Cloner et installer

```bash
git clone https://github.com/votre-username/forja.git
cd forja
npm install
cd frontend && npm install && cd ..
```

### 2. PostgreSQL

**MacOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql
createdb forja
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb forja
```

**Windows:**
Téléchargez [PostgreSQL](https://www.postgresql.org/download/windows/) et créez une base `forja`.

### 3. Configuration

```bash
cp .env.example .env
```

**Éditez `.env`** - Minimum requis :

```env
# Obligatoire
DATABASE_URL="postgresql://user:password@localhost:5432/forja"
ANTHROPIC_API_KEY=sk-ant-votre_cle_claude
JWT_SECRET=un_secret_aleatoire_tres_long

# Optionnel (pour tester les paiements plus tard)
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_PRICE_ID_PRO=price_...
```

### 4. Base de données

```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

### 5. Lancer l'app

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Accéder à l'app

Ouvrez http://localhost:3000

**Compte démo:**
- Email : `demo@forja.dev`
- Mot de passe : `demo123`

---

## 🎯 Premiers Pas

### Créer votre premier compte

1. Cliquez sur **Connexion** (en haut à droite)
2. Cliquez sur **Pas de compte ? Inscrivez-vous**
3. Remplissez le formulaire
4. Vous êtes automatiquement connecté !

### Générer votre première app

1. Cliquez sur **Créer une app** ou allez dans `/builder`
2. Dans le chat, tapez :
   ```
   Créer une calculatrice avec un design moderne orange et noir
   ```
3. Appuyez sur Entrée
4. Attendez 10-30 secondes
5. Votre code est généré ! Consultez les onglets **Aperçu** et **Code**

### Modifier l'app

Dans le chat, continuez la conversation :
```
Ajouter un bouton pour effacer tout
```

L'IA modifie le code automatiquement !

### Exporter l'app

1. Onglet **Export**
2. Sélectionnez les plateformes (Windows, Mac, Linux)
3. Cliquez **Compiler** (en haut à droite)
4. Attendez 5-10 minutes
5. Téléchargez vos exécutables !

---

## 🛠️ Outils Utiles

### Voir la base de données

```bash
npx prisma studio
```

Ouvre une interface web sur http://localhost:5555

### Logs Backend

```bash
npm run dev
```

Les logs s'affichent en temps réel.

### Stripe (Optionnel)

Pour tester les paiements :

1. Créez un compte [Stripe](https://stripe.com)
2. Mode test activé par défaut
3. Créez 2 produits :
   - Forja Pro : 15€/mois
   - Forja Business : 49€/mois
4. Ajoutez les `price_id` dans `.env`

**Carte de test:**
- Numéro : `4242 4242 4242 4242`
- Date : N'importe quelle date future
- CVC : N'importe quel 3 chiffres

---

## ❓ Problèmes Courants

### Erreur de connexion PostgreSQL

```bash
# Vérifier que PostgreSQL tourne
# MacOS
brew services list

# Linux
sudo systemctl status postgresql
```

Si arrêté, démarrez-le :
```bash
# MacOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Port 3000 ou 3001 déjà utilisé

Changez dans `.env` :
```env
PORT=3002
```

Et dans `frontend/vite.config.js` :
```js
server: {
  port: 3003,
  proxy: {
    '/api': 'http://localhost:3002'
  }
}
```

### Erreur Prisma "Table doesn't exist"

Réinitialisez la base :
```bash
npx prisma migrate reset
npx prisma generate
npm run db:seed
```

### Erreur "Claude API key invalid"

Vérifiez que la clé dans `.env` est correcte :
- Commence par `sk-ant-`
- Pas d'espaces avant/après
- Créez-en une nouvelle sur [console.anthropic.com](https://console.anthropic.com)

---

## 📚 Ressources

- **README complet**: [README.md](./README.md)
- **Déploiement production**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Documentation Prisma**: https://www.prisma.io/docs
- **Documentation Stripe**: https://stripe.com/docs

---

## 🚀 Prochaines Étapes

Une fois l'app qui tourne :

1. **Explorez le code**
   - Backend : `routes/`, `services/`
   - Frontend : `frontend/src/pages/`

2. **Testez les fonctionnalités**
   - Créez plusieurs projets
   - Testez les modifications
   - Essayez différents types d'apps

3. **Personnalisez**
   - Changez les couleurs dans `frontend/tailwind.config.js`
   - Ajoutez des templates dans `templates/`
   - Modifiez les prompts dans `services/claudeService.js`

4. **Déployez**
   - Suivez [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Configurez un domaine
   - Activez Stripe en mode live

---

**Besoin d'aide ?** Ouvrez une issue sur GitHub ou consultez la documentation complète.

Bon développement avec Forja ! ⚡
