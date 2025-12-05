# 🐳 Déploiement Docker - Forja

Guide complet pour déployer Forja sur votre VPS avec Docker.

---

## 📋 Prérequis VPS

- **OS** : Ubuntu 20.04+ (ou Debian)
- **RAM** : Minimum 2GB (4GB recommandé)
- **Espace disque** : 20GB minimum
- **Accès** : SSH root ou sudo
- **Nom de domaine** : Pointant vers l'IP du VPS

---

## ⚡ Installation Rapide (5 minutes)

### 1. Connectez-vous au VPS

```bash
ssh root@votre-ip-vps
```

### 2. Installez Docker

```bash
# Mise à jour
apt update && apt upgrade -y

# Installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installation Docker Compose
apt install -y docker-compose

# Vérification
docker --version
docker-compose --version
```

### 3. Clonez le projet

```bash
# Créez un dossier
mkdir -p /var/www
cd /var/www

# Clonez (ou uploadez via SFTP)
git clone https://github.com/votre-repo/forja.git
cd forja
```

### 4. Configuration

```bash
# Copiez .env.production vers .env
cp .env.production .env

# Éditez avec vos vraies valeurs
nano .env
```

**Variables OBLIGATOIRES à changer :**
```env
POSTGRES_PASSWORD=ChangezMoiAvecUnMotDePasseSecurise123!
JWT_SECRET=GenerezAvecOpensslRand32Caracteres...
ANTHROPIC_API_KEY=sk-ant-votre_cle_claude_ici
CORS_ORIGIN=https://votre-domaine.com
```

**Pour générer JWT_SECRET :**
```bash
openssl rand -base64 32
```

### 5. Lancez le déploiement

```bash
# Rendez le script exécutable
chmod +x scripts/deploy.sh

# Déployez !
./scripts/deploy.sh
```

---

## 🚀 Le script fait automatiquement :

✅ Vérifie que .env existe
✅ Arrête les anciens containers
✅ Build les images Docker
✅ Démarre PostgreSQL, Backend, Frontend, Nginx
✅ Exécute les migrations Prisma
✅ Seed la base avec compte admin

---

## 🔍 Vérification

### 1. Voir les containers

```bash
docker-compose ps
```

Vous devriez voir :
- `forja-postgres` → healthy
- `forja-backend` → up
- `forja-frontend` → up
- `forja-nginx` → up

### 2. Vérifier les logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. Tester l'application

```bash
# Health check
curl http://localhost/health

# Devrait retourner: {"status":"ok",...}
```

**Dans votre navigateur :**
- Frontend : `http://votre-ip-vps`
- API : `http://votre-ip-vps/api/...`

---

## 🔒 Configuration SSL (HTTPS)

### Option 1 : Let's Encrypt (gratuit)

```bash
chmod +x scripts/setup-ssl.sh
./scripts/setup-ssl.sh votre-domaine.com
```

### Option 2 : Manuel

1. Obtenez vos certificats SSL
2. Placez-les dans `nginx/ssl/`:
   - `fullchain.pem`
   - `privkey.pem`
3. Décommentez la section HTTPS dans `nginx/conf.d/forja.conf`
4. Redémarrez : `docker-compose restart nginx`

---

## 🛠️ Commandes Utiles

### Gestion des containers

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Redémarrer un service
docker-compose restart backend

# Rebuild après changements
docker-compose up -d --build

# Supprimer tout (⚠️ ATTENTION: supprime les données)
docker-compose down -v
```

### Logs et Debug

```bash
# Logs temps réel
docker-compose logs -f

# Logs d'un service
docker-compose logs backend

# Entrer dans un container
docker-compose exec backend sh
docker-compose exec postgres psql -U forja

# Voir l'utilisation ressources
docker stats
```

### Base de Données

```bash
# Accéder à PostgreSQL
docker-compose exec postgres psql -U forja -d forja

# Backup
docker-compose exec postgres pg_dump -U forja forja > backup.sql

# Restore
docker-compose exec -T postgres psql -U forja forja < backup.sql

# Migrations
docker-compose exec backend npx prisma migrate deploy

# Prisma Studio (interface visuelle)
docker-compose exec backend npx prisma studio
# Puis accéder à http://votre-ip:5555
```

### Monitoring

```bash
# Espace disque
df -h

# Mémoire
free -h

# Containers actifs
docker ps

# Nettoyage Docker
docker system prune -a
```

---

## 📊 Structure Docker

```
forja/
├── Dockerfile              # Backend
├── docker-compose.yml      # Orchestration
├── .dockerignore          # Fichiers exclus
├── frontend/
│   ├── Dockerfile         # Frontend
│   └── nginx.conf         # Config Nginx frontend
├── nginx/
│   ├── nginx.conf         # Config Nginx principale
│   └── conf.d/
│       └── forja.conf     # Reverse proxy
└── scripts/
    ├── deploy.sh          # Script déploiement
    └── setup-ssl.sh       # Script SSL
```

---

## 🔥 Mises à Jour

### Déployer une nouvelle version

```bash
# 1. Pull les changements
git pull origin main

# 2. Rebuild et redémarrer
docker-compose up -d --build

# 3. Migrations si nécessaires
docker-compose exec backend npx prisma migrate deploy
```

---

## 🚨 Troubleshooting

### Problème : Container backend crash

```bash
# Voir les logs
docker-compose logs backend

# Causes fréquentes:
# - .env mal configuré
# - Base de données non accessible
# - Clé API Claude invalide
```

### Problème : Postgres ne démarre pas

```bash
# Vérifier les volumes
docker volume ls

# Recréer la base (⚠️ PERTE DE DONNÉES)
docker-compose down -v
docker-compose up -d
```

### Problème : Port 80 déjà utilisé

```bash
# Voir ce qui utilise le port
sudo lsof -i :80

# Arrêter Apache/Nginx système
sudo systemctl stop apache2
sudo systemctl stop nginx
```

### Problème : Manque de mémoire

```bash
# Limiter la mémoire dans docker-compose.yml
services:
  backend:
    mem_limit: 512m
  frontend:
    mem_limit: 256m
```

---

## 🔐 Sécurité Production

### 1. Firewall

```bash
# Installer UFW
apt install -y ufw

# Autoriser uniquement nécessaire
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### 2. SSH sécurisé

```bash
# Désactiver root login
nano /etc/ssh/sshd_config
# PermitRootLogin no

# Utiliser clés SSH uniquement
# PasswordAuthentication no

systemctl restart sshd
```

### 3. Auto-updates

```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### 4. Monitoring

Installez [Portainer](https://www.portainer.io/) pour gérer Docker visuellement :

```bash
docker volume create portainer_data

docker run -d -p 9000:9000 \
  --name portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Accès : `http://votre-ip:9000`

---

## 💾 Backup Automatique

Créez `/root/backup-forja.sh` :

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/forja"

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker-compose exec -T postgres pg_dump -U forja forja > $BACKUP_DIR/db_$DATE.sql

# Backup volumes
docker run --rm -v forja_postgres_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/volumes_$DATE.tar.gz /data

# Garder seulement 7 derniers jours
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup terminé: $DATE"
```

Automatisez avec cron :

```bash
chmod +x /root/backup-forja.sh
crontab -e
```

Ajoutez :
```
0 2 * * * /root/backup-forja.sh >> /var/log/forja-backup.log 2>&1
```

---

## 📈 Performance

### Ajuster les ressources

Dans `docker-compose.yml` :

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          memory: 512M
```

### Cache Redis (optionnel)

Ajoutez dans `docker-compose.yml` :

```yaml
services:
  redis:
    image: redis:alpine
    restart: unless-stopped
    networks:
      - forja-network
```

---

## ✅ Checklist Production

- [ ] .env configuré avec vraies valeurs
- [ ] SSL/HTTPS activé
- [ ] Firewall configuré
- [ ] Backups automatiques activés
- [ ] Monitoring (Portainer ou autre)
- [ ] DNS configuré
- [ ] Stripe en mode LIVE
- [ ] Tests E2E effectués
- [ ] Logs centralisés
- [ ] Alertes configurées

---

**Votre application Forja est maintenant en production ! 🚀**

Support : Consultez les logs avec `docker-compose logs -f`
