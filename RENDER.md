# Déployer VideoFlow sur Render

Le fichier `render.yaml` permet de créer automatiquement le Web Service Render avec les commandes de build, de démarrage, le contrôle de santé et les variables d’environnement.

## Déploiement Blueprint

1. Envoyer ce dépôt sur GitHub.
2. Dans Render, choisir **New → Blueprint**.
3. Sélectionner le dépôt GitHub contenant VideoFlow.
4. Render détecte automatiquement `render.yaml`.
5. Renseigner uniquement les variables marquées `sync: false` dans Render, puis lancer le déploiement.

Les secrets ne peuvent pas être préremplis dans GitHub ou dans `render.yaml`. Cette étape est obligatoire pour protéger la base de données, OAuth et le stockage cloud.

## Variables à fournir

`DATABASE_URL` doit être la chaîne de connexion de la base MySQL/TiDB. `VITE_APP_ID`, `OAUTH_SERVER_URL` et `VITE_OAUTH_PORTAL_URL` doivent correspondre au fournisseur OAuth utilisé. `OWNER_OPEN_ID` identifie le propriétaire du projet. `BUILT_IN_FORGE_API_URL` et `BUILT_IN_FORGE_API_KEY` sont nécessaires au service de stockage cloud configuré ; `VITE_FRONTEND_FORGE_API_URL` et `VITE_FRONTEND_FORGE_API_KEY` sont les valeurs frontend correspondantes. `VITE_APP_LOGO`, `VITE_ANALYTICS_ENDPOINT` et `VITE_ANALYTICS_WEBSITE_ID` sont facultatives selon la configuration du projet.

`JWT_SECRET` est généré automatiquement par Render dans le Blueprint. `NODE_ENV`, `NODE_VERSION`, `OWNER_NAME`, `VITE_APP_TITLE` et `PORT` sont déjà configurés.

## Vérifications post-déploiement

Le projet inclut un smoke test automatisé nommé `check:render`. Il compile d’abord l’application avec `pnpm build`, démarre le bundle de production sur un port temporaire, attend que le serveur réponde, puis vérifie que la route `/` renvoie une réponse HTTP valide. Render l’exécute automatiquement à la fin de la commande de build définie dans `render.yaml` :

```bash
pnpm check:render
```

Pour lancer cette vérification manuellement après une modification, exécutez `pnpm build && pnpm check:render`. Le résultat attendu est `Render smoke test passed`. Un échec signifie généralement que le bundle ne démarre pas, qu’une variable obligatoire manque ou que la page d’accueil ne répond pas. Dans ce cas, consultez les logs du déploiement Render, vérifiez les variables d’environnement et relancez le déploiement.

Après le premier déploiement, ouvrir l’URL `onrender.com`, vérifier que la page d’accueil s’affiche, puis tester la connexion OAuth. Dans le fournisseur OAuth, ajouter l’URL Render comme origine autorisée ainsi que :

```text
https://VOTRE-SERVICE.onrender.com/api/oauth/callback
```

Le serveur utilise le port fourni par Render et écoute sur le port public configuré par la plateforme. Les commandes utilisées sont :

```text
Build:  corepack enable && pnpm install --frozen-lockfile && pnpm build
Start:  pnpm start
```

Pour les téléchargements vidéo, utiliser un stockage objet persistant. Le système de fichiers local d’un Web Service Render ne doit pas être considéré comme un espace de stockage permanent.
