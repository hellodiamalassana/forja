# 🚀 Guide de Déploiement Forja

Guide complet pour déployer Forja en production.

---

## 📋 Prérequis

- **Serveur** : Ubuntu 20.04+ ou similaire
- **Node.js** : 18.0.0+
- **PostgreSQL** : 14+
- **Nom de domaine** : Pour HTTPS
- **Comptes nécessaires** :
  - Anthropic Claude API
  - Stripe
  - (Optionnel) AWS S3 pour stockage

---

## 1️⃣  Configuration de la Base de Données

### Installation PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Création de la base

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE forja;
CREATE USER forja_user WITH ENCRYPTED PASSWORD 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE forja TO forja_user;
\q
```

### Migration Prisma

```bash
# Dans le dossier du projet
npm install
npx prisma migrate deploy
npx prisma generate
npm run db:seed
```

---

## 2️⃣  Configuration des Variables d'Environnement

Créez `.env` en production :

```bash
# Database
DATABASE_URL="postgresql://forja_user:mot_de_passe@localhost:5432/forja?schema=public"

# JWT
JWT_SECRET="generez_une_cle_secrete_tres_longue_et_aleatoire"
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_votre_cle_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
STRIPE_PRICE_ID_PRO=price_xxxxx
STRIPE_PRICE_ID_BUSINESS=price_xxxxx

# API
PORT=3001
NODE_ENV=production

# Claude
ANTHROPIC_API_KEY=sk-ant-votre_cle_claude

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS (votre domaine frontend)
CORS_ORIGIN=https://forja.votredomaine.com

# Generation
MAX_PROJECT_SIZE_MB=50
TEMP_DIR=/var/forja/temp
OUTPUT_DIR=/var/forja/generated
```

---

## 3️⃣  Configuration Stripe

### Créer les produits

1. Accédez au [Dashboard Stripe](https://dashboard.stripe.com)
2. Allez dans **Produits** → **Ajouter un produit**
3. Créez 2 produits :
   - **Forja Pro** : 15€/mois
   - **Forja Business** : 49€/mois
4. Copiez les `price_id` dans votre `.env`

### Configurer le Webhook

1. **Webhooks** → **Ajouter un endpoint**
2. URL : `https://api.votredomaine.com/api/stripe/webhook`
3. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copiez le secret dans `STRIPE_WEBHOOK_SECRET`

---

## 4️⃣  Déploiement Backend

### Avec PM2 (recommandé)

```bash
# Installer PM2
npm install -g pm2

# Démarrer l'application
pm2 start server.js --name forja-api

# Configurer le démarrage auto
pm2 startup
pm2 save

# Monitorer
pm2 logs forja-api
pm2 monit
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.votredomaine.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Augmenter timeout pour builds longs
    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
}
```

### Certificat SSL avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.votredomaine.com
```

---

## 5️⃣  Déploiement Frontend

### Build de production

```bash
cd frontend
npm install
npm run build
```

### Servir avec Nginx

```nginx
server {
    listen 80;
    server_name forja.votredomaine.com;

    root /var/www/forja/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache pour assets
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### SSL Frontend

```bash
sudo certbot --nginx -d forja.votredomaine.com
```

---

## 6️⃣  Configuration Sécurité

### Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Limites PostgreSQL

Éditez `/etc/postgresql/14/main/postgresql.conf` :

```
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
```

### Backup automatique

Créez `/etc/cron.daily/forja-backup` :

```bash
#!/bin/bash
pg_dump -U forja_user forja > /backup/forja_$(date +%Y%m%d).sql
find /backup -name "forja_*.sql" -mtime +7 -delete
```

```bash
chmod +x /etc/cron.daily/forja-backup
```

---

## 7️⃣  Monitoring

### Logs

```bash
# Backend
pm2 logs forja-api

# Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# PostgreSQL
tail -f /var/log/postgresql/postgresql-14-main.log
```

### Uptime Monitoring

Utilisez des services comme :
- UptimeRobot
- Pingdom
- StatusCake

Endpoint à monitorer : `https://api.votredomaine.com/health`

---

## 8️⃣  Optimisations Production

### Node.js

```bash
# Augmenter limite mémoire
pm2 start server.js --name forja-api --node-args="--max-old-space-size=2048"
```

### PostgreSQL Connection Pooling

Installez `pg-pool` ou utilisez un service comme **PgBouncer**.

### CDN

Pour le frontend, utilisez Cloudflare ou AWS CloudFront.

---

## 9️⃣  Checklist Pré-Lancement

- [ ] Base de données migrée et seedée
- [ ] Variables d'environnement configurées
- [ ] Stripe produits créés et webhook configuré
- [ ] SSL/HTTPS activé (frontend + backend)
- [ ] PM2 configuré avec auto-restart
- [ ] Backups automatiques activés
- [ ] Monitoring configuré
- [ ] Tests de bout en bout effectués
- [ ] Rate limiting testé
- [ ] Emails de confirmation (si applicable)

---

## 🆘 Dépannage

### Erreur de connexion DB

```bash
# Vérifier que PostgreSQL écoute
sudo netstat -plunt | grep postgres

# Tester la connexion
psql -U forja_user -d forja -h localhost
```

### Build Electron échoue

- Vérifier espace disque : `df -h`
- Augmenter timeout dans `electronGenerator.js`
- Vérifier dépendances système : `apt install build-essential`

### Webhook Stripe ne fonctionne pas

- Vérifier que l'URL est accessible publiquement
- Tester avec Stripe CLI : `stripe listen --forward-to localhost:3001/api/stripe/webhook`
- Vérifier les logs : `pm2 logs forja-api | grep stripe`

---

## 📊 Coûts Mensuels Estimés

| Service | Coût |
|---------|------|
| VPS (4GB RAM) | 15-25€ |
| PostgreSQL hébergé (opt.) | 0-30€ |
| Claude API (500 req/mois) | 100-200€ |
| Stripe fees | 2.9% + 0.25€ par transaction |
| Nom de domaine | 10€/an |
| **Total** | **~150-300€/mois** |

Pour réduire les coûts :
- Utiliser PostgreSQL local
- Limiter les requêtes Claude avec cache
- Offrir plus de plans payants

---

**Besoin d'aide ?** Consultez la [documentation complète](../README.md) ou ouvrez une issue.
