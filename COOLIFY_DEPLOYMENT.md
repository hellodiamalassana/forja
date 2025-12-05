# 🚀 Déploiement Forja avec Coolify

Guide complet pour déployer Forja sur votre VPS avec Coolify.

---

## 📋 Qu'est-ce que Coolify ?

Coolify est une plateforme self-hosted alternative à Heroku/Vercel/Netlify. Elle simplifie le déploiement d'applications Docker directement sur votre VPS.

**Avantages :**
- ✅ Interface graphique intuitive
- ✅ Déploiement en un clic depuis GitHub
- ✅ SSL automatique (Let's Encrypt)
- ✅ Logs en temps réel
- ✅ Rollback facile
- ✅ Webhooks GitHub (auto-deploy)
- ✅ Monitoring intégré

---

## ⚡ Installation Rapide (10 minutes)

### 1. Prérequis VPS

- **OS** : Ubuntu 22.04 LTS
- **RAM** : Minimum 4GB
- **CPU** : 2 cores minimum
- **Espace** : 50GB
- **IP publique** : Oui
- **Nom de domaine** : Pointant vers l'IP (optionnel mais recommandé)

### 2. Installer Coolify

Sur votre VPS :

```bash
# Connexion SSH
ssh root@votre-ip-vps

# Installation Coolify (un seul script !)
curl -fsSL https://get.coollabs.io/coolify/install.sh | bash

# Le script installe Docker, Docker Compose et Coolify
# Durée : ~5 minutes
```

**Coolify sera accessible sur :**
```
http://votre-ip:8000
```

### 3. Configuration Initiale Coolify

1. **Accédez à Coolify** : `http://votre-ip:8000`
2. **Créez votre compte admin** (premier utilisateur)
3. **Configurez votre serveur** :
   - Name: `Production Server`
   - Type: `Localhost`
   - Validez la connexion

---

## 🔗 Déploiement Forja depuis GitHub

### Étape 1 : Connecter GitHub

1. Dans Coolify, allez dans **Sources**
2. Cliquez **Add Source**
3. Choisissez **GitHub**
4. Suivez le flow OAuth pour autoriser
5. Sélectionnez l'organisation **K-ETA-COMPANY**

### Étape 2 : Créer le Projet

1. **New Project** → Nom : `Forja`
2. **Add Application**
3. Sélectionnez :
   - Source : **GitHub**
   - Repository : **K-ETA-COMPANY/forja**
   - Branch : `main` (ou votre branche de prod)
   - Type : **Docker Compose**

### Étape 3 : Configuration Environnement

Coolify détectera automatiquement `docker-compose.yml`. Ajoutez les variables d'environnement :

```env
# Database
POSTGRES_USER=forja
POSTGRES_PASSWORD=VotreMotDePasseSecurise123!
POSTGRES_DB=forja

# JWT - Générez avec: openssl rand -base64 32
JWT_SECRET=VotreCleJWTSecuriseeTresLongue...
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_votre_cle_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
STRIPE_PRICE_ID_PRO=price_xxxxx
STRIPE_PRICE_ID_BUSINESS=price_xxxxx

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-votre_cle_claude

# CORS (votre domaine)
CORS_ORIGIN=https://forja.votredomaine.com
```

### Étape 4 : Configuration Domaine

1. Dans **Domains** :
   - Ajoutez : `forja.votredomaine.com`
   - Coolify générera automatiquement le certificat SSL !

2. Configurez votre DNS (chez votre registrar) :
   ```
   Type: A
   Name: forja
   Value: votre-ip-vps
   ```

### Étape 5 : Déployer !

1. Cliquez **Deploy**
2. Coolify va :
   - Clone le repo
   - Build les images Docker
   - Démarre les services
   - Configure Nginx automatiquement
   - Génère le SSL avec Let's Encrypt

**Durée : ~5-10 minutes**

---

## 📊 Monitoring dans Coolify

Une fois déployé, vous avez accès à :

### Dashboard
- **Status** : Services running/stopped
- **Resources** : CPU, RAM, Disk usage
- **Logs** : Temps réel pour chaque service
- **Metrics** : Graphiques de performance

### Services Déployés

Coolify montre tous vos containers :
- `forja-postgres` - Base de données
- `forja-backend` - API Node.js
- `forja-frontend` - React app
- `forja-nginx` - Reverse proxy

### Logs en Temps Réel

```
Dashboard → Logs → Sélectionnez le service
```

Vous voyez tous les logs comme avec `docker-compose logs -f` mais dans une belle interface !

---

## 🔄 Auto-Deploy avec GitHub Webhooks

### Configuration Auto-Deploy

1. Dans votre projet Coolify → **Settings**
2. Activez **Automatic Deployment**
3. Copiez l'URL du webhook
4. Dans GitHub (K-ETA-COMPANY/forja) :
   - **Settings** → **Webhooks** → **Add webhook**
   - Paste URL: `URL copiée de Coolify`
   - Content type: `application/json`
   - Events: `Just the push event`
   - Activez

**Maintenant :**
- Chaque `git push` sur `main` redéploie automatiquement ! 🚀

---

## 🔧 Configuration Spécifique Coolify

### docker-compose.yml Optimisé

Notre `docker-compose.yml` existant fonctionne parfaitement avec Coolify !

Coolify gère automatiquement :
- ✅ Network isolation
- ✅ SSL/TLS certificates
- ✅ Reverse proxy
- ✅ Load balancing
- ✅ Health checks
- ✅ Logging

### Build Args (si nécessaire)

Si vous avez besoin de build args :

Dans Coolify → **Build Configuration** :
```
ARGS: NODE_ENV=production
```

### Commandes Post-Deploy

Coolify peut exécuter des commandes après le déploiement :

**Post-Deploy Script :**
```bash
# Migrations Prisma
docker-compose exec -T backend npx prisma migrate deploy

# Seed (si première fois)
docker-compose exec -T backend npm run db:seed || true
```

Ajoutez dans Coolify → **Scripts** → **After Deployment**

---

## 🔐 Gestion des Secrets

### Variables d'Environnement Sécurisées

Dans Coolify, vos secrets sont :
- ✅ Chiffrés au repos
- ✅ Jamais exposés dans les logs
- ✅ Versionnés (historique)
- ✅ Exportables/importables

### Rotation des Secrets

Pour changer une clé API :
1. Coolify → **Environment** → Modifiez la valeur
2. **Redeploy** → Coolify redémarre avec la nouvelle valeur

---

## 📈 Scaling avec Coolify

### Vertical Scaling (plus de ressources)

Ajustez les limites dans `docker-compose.yml` :

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
```

Puis **Redeploy**.

### Horizontal Scaling (plusieurs instances)

```yaml
services:
  backend:
    deploy:
      replicas: 3
```

Coolify gère le load balancing automatiquement !

---

## 💾 Backups avec Coolify

### Base de Données Automatique

1. Coolify → **Backups**
2. Activez **PostgreSQL Backup**
3. Configurez :
   - Fréquence : Quotidien (2h du matin)
   - Rétention : 7 jours
   - Destination : Local ou S3

### Restoration

En cas de problème :
1. **Backups** → Sélectionnez le backup
2. **Restore**
3. Coolify restaure automatiquement

---

## 🔄 Rollback Facile

### Revenir à une Version Précédente

1. **Deployments** → Historique
2. Sélectionnez le déploiement stable
3. **Redeploy this version**

**En 2 clics, vous êtes revenu en arrière !**

---

## 🚨 Monitoring & Alertes

### Configurer les Alertes

Coolify peut vous notifier :
- 📧 Email
- 💬 Discord
- 📱 Telegram
- 🔔 Slack

**Configuration :**
1. **Settings** → **Notifications**
2. Ajoutez votre webhook/email
3. Sélectionnez les événements :
   - Deployment failed
   - Service down
   - Resource usage > 80%

---

## 🛠️ Commandes Utiles dans Coolify

### Shell dans Container

1. **Services** → Sélectionnez le service
2. **Terminal** → Ouvre un shell interactif

```bash
# Exemples de commandes
npx prisma studio
npm run db:seed
node scripts/admin-create.js
```

### Redémarrer un Service

```
Services → backend → Restart
```

### Voir les Logs

```
Logs → backend → Filtrer par niveau (error, warn, info)
```

---

## 📊 Tableau de Bord Forja Admin

Après déploiement, accédez à :

- **Frontend** : `https://forja.votredomaine.com`
- **API** : `https://forja.votredomaine.com/api`
- **Admin** : Connectez-vous avec `admin@forja.dev` / `admin123`

---

## ✅ Checklist Coolify

- [ ] Coolify installé sur VPS
- [ ] Compte admin créé
- [ ] GitHub connecté
- [ ] Repository K-ETA-COMPANY/forja importé
- [ ] Variables d'environnement configurées
- [ ] Domaine ajouté et DNS configuré
- [ ] Premier déploiement réussi
- [ ] SSL automatique généré
- [ ] Auto-deploy webhook configuré
- [ ] Backups activés
- [ ] Alertes configurées
- [ ] Compte admin Forja testé

---

## 🎯 Avantages Coolify pour Forja

| Feature | Sans Coolify | Avec Coolify |
|---------|--------------|--------------|
| SSL/HTTPS | Config manuelle | ✅ Automatique |
| Déploiement | SSH + scripts | ✅ Un clic |
| Monitoring | Terminal logs | ✅ Dashboard |
| Rollback | Git revert | ✅ Interface |
| Scaling | Docker Compose | ✅ GUI |
| Backups | Scripts cron | ✅ Intégré |
| Auto-deploy | Manual | ✅ GitHub webhook |

---

## 🔗 Ressources

- **Coolify Docs** : https://coolify.io/docs
- **Coolify Discord** : https://coollabs.io/discord
- **GitHub Forja** : https://github.com/K-ETA-COMPANY/forja

---

## 🆘 Troubleshooting Coolify

### Build échoue

**Voir les logs de build :**
```
Deployments → Failed deployment → Build Logs
```

**Causes fréquentes :**
- Variables d'environnement manquantes
- Erreur dans Dockerfile
- Dépendances npm manquantes

### Service ne démarre pas

**Check healthcheck :**
```
Services → backend → Health Status
```

Si "Unhealthy" :
- Vérifier DATABASE_URL
- Vérifier ANTHROPIC_API_KEY
- Vérifier logs du container

### SSL ne se génère pas

**Vérifications :**
1. DNS correctement configuré (A record)
2. Port 80/443 ouverts sur firewall
3. Domaine accessible depuis internet

**Forcer régénération :**
```
Domains → Regenerate Certificate
```

---

## 🎉 Résultat Final

Avec Coolify, vous avez :

✅ **Déploiement en 1 clic** depuis GitHub
✅ **SSL automatique** avec Let's Encrypt
✅ **Auto-deploy** sur chaque push
✅ **Monitoring** avec dashboard
✅ **Backups** automatiques
✅ **Rollback** facile
✅ **Logs** en temps réel
✅ **Scaling** simple

**Forja est maintenant production-ready avec une infrastructure professionnelle ! 🚀**

---

**Support :** Si problème, consultez les logs dans Coolify ou contactez #forja sur Discord.
