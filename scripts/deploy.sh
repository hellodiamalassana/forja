#!/bin/bash

# Forja Deployment Script
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 Déploiement de Forja..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Fichier .env non trouvé${NC}"
    echo -e "${YELLOW}📝 Copiez .env.production vers .env et remplissez les valeurs${NC}"
    echo "cp .env.production .env"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    echo "Installez Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    echo "Installez Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Arrêt des containers existants...${NC}"
docker-compose down || true

# Build images
echo -e "${YELLOW}🔨 Build des images Docker...${NC}"
docker-compose build --no-cache

# Start services
echo -e "${YELLOW}▶️  Démarrage des services...${NC}"
docker-compose up -d

# Wait for database
echo -e "${YELLOW}⏳ Attente de la base de données...${NC}"
sleep 10

# Run migrations
echo -e "${YELLOW}📊 Exécution des migrations...${NC}"
docker-compose exec backend npx prisma migrate deploy

# Seed database (optional)
echo -e "${YELLOW}🌱 Seed de la base de données...${NC}"
docker-compose exec backend npm run db:seed || echo "Seed déjà exécuté ou erreur"

# Show status
echo ""
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo ""
echo "📊 Status des containers:"
docker-compose ps
echo ""
echo "🌐 Application disponible sur:"
echo "   Frontend: http://localhost"
echo "   API: http://localhost/api"
echo "   Health: http://localhost/health"
echo ""
echo "📝 Logs en temps réel:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Arrêter l'application:"
echo "   docker-compose down"
echo ""
echo -e "${YELLOW}⚠️  N'oubliez pas de configurer SSL/HTTPS pour la production !${NC}"
