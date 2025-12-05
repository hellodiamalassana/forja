# 🚀 Push vers GitHub K-ETA-COMPANY/forja

## Sur ton ordinateur local :

```bash
# 1. Clone le projet actuel (si pas déjà fait)
git clone <url-du-projet-actuel>
cd forja

# 2. Ajoute le nouveau remote
git remote add keta https://github.com/K-ETA-COMPANY/forja.git

# 3. Vérifie les remotes
git remote -v

# 4. Push la branche vers le nouveau repo
git push keta claude/ai-app-builder-013akSGXfZu442jzaB3tuR33:main

# Ou si tu veux push toutes les branches
git push keta --all
git push keta --tags
```

## Si tu veux renommer la branche avant de push :

```bash
# Créer une branche main depuis ta branche actuelle
git checkout -b main
git push keta main
```

## Authentification GitHub

Si demandé, utilise :
- **Username** : ton username GitHub
- **Password** : un Personal Access Token (PAT)

### Créer un PAT :
1. GitHub.com → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Scopes : `repo` (full control)
5. Copie le token
6. Utilise-le comme mot de passe

---

## Tout est prêt ! 🎉

Une fois pushé sur https://github.com/K-ETA-COMPANY/forja, tu pourras :
1. Connecter Coolify au repo
2. Déployer en un clic
3. Profiter de l'auto-deploy

Voir le guide complet : `COOLIFY_DEPLOYMENT.md`
