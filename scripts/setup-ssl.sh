#!/bin/bash

# SSL Setup with Let's Encrypt
# Usage: ./scripts/setup-ssl.sh votredomaine.com

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Usage: ./scripts/setup-ssl.sh votredomaine.com"
    exit 1
fi

echo "🔒 Configuration SSL pour $DOMAIN..."

# Install certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Installation de Certbot..."
    sudo apt update
    sudo apt install -y certbot
fi

# Stop nginx temporarily
echo "🛑 Arrêt temporaire de Nginx..."
docker-compose stop nginx

# Get certificate
echo "📜 Obtention du certificat SSL..."
sudo certbot certonly --standalone \
    -d $DOMAIN \
    --agree-tos \
    --register-unsafely-without-email \
    --non-interactive

# Create ssl directory
mkdir -p nginx/ssl

# Copy certificates
echo "📋 Copie des certificats..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/
sudo chmod 644 nginx/ssl/*.pem

# Update nginx config
echo "⚙️  Mise à jour de la configuration Nginx..."
sed -i "s/votre-domaine.com/$DOMAIN/g" nginx/conf.d/forja.conf

# Restart nginx
echo "▶️  Redémarrage de Nginx..."
docker-compose up -d nginx

echo "✅ SSL configuré avec succès !"
echo ""
echo "🔄 Configuration du renouvellement automatique..."
echo "0 0 * * * certbot renew --quiet && docker-compose restart nginx" | sudo tee -a /etc/crontab

echo ""
echo "🌐 Votre site est maintenant disponible sur https://$DOMAIN"
