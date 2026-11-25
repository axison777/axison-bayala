# Axison Bayala — Portfolio Next.js

Portfolio public et administration privée dans **une seule application Next.js**. Le déploiement gratuit prévu utilise **Render Web Service + Neon PostgreSQL + Cloudinary**. Aucun serveur API séparé n’est nécessaire.

## Dépôt et architecture

Le dépôt `axison777/axison-bayala` contient le site, le tableau de bord et les routes backend `/api/admin/*`. Le dépôt `axison-bayala-api` est réservé à une éventuelle séparation ultérieure.

- Render : application Next.js, une seule URL.
- Neon : contenu, brouillons, compte administrateur, sessions, limitation des connexions et références des médias.
- Cloudinary : images et PDF importés depuis l’administration.
- Les captures, logos et CV déjà intégrés sont servis depuis `public/`.

## Déploiement gratuit sur Render

### 1. Créer la base Neon

Crée un projet gratuit et récupère l’URL PostgreSQL **pooled** depuis Connect. Conserve les paramètres TLS fournis (`sslmode`, `channel_binding`). Cette URL reste uniquement dans les variables serveur.

### 2. Créer le compte Cloudinary

Depuis la console Cloudinary, récupère le **Cloud name**, l’**API key** et l’**API secret**. Les envois sont signés côté serveur, après authentification administrateur. Pour importer un nouveau CV PDF, autorise aussi la livraison des fichiers PDF dans les paramètres de sécurité Cloudinary si ton compte la bloque par défaut.

### 3. Créer le Web Service

Dans Render, connecte le dépôt `axison-bayala` et sélectionne :

- Type : **Web Service**, environnement **Docker**.
- Dossier racine : vide si le dépôt commence directement par `package.json` et `Dockerfile`.
- Offre : **Free**.
- Dockerfile : `./Dockerfile`.
- Health check : `/`.
- Aucun disque persistant : données et médias sont stockés à distance.
- Laisse la commande Docker par défaut ; elle initialise la base puis lance Next.js.

Renseigne les variables suivantes dans Render :

| Variable | Valeur |
| --- | --- |
| `APP_URL` | URL HTTPS exacte du service, sans chemin, par exemple `https://ton-service.onrender.com` |
| `DATABASE_URL` | URL PostgreSQL pooled de Neon |
| `ADMIN_EMAIL` | Ton email de connexion |
| `ADMIN_INITIAL_PASSWORD` | Ton mot de passe initial, 14 caractères minimum |
| `CLOUDINARY_CLOUD_NAME` | Cloud name Cloudinary |
| `CLOUDINARY_API_KEY` | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | API secret Cloudinary |

`render.yaml` permet également de créer le service via un Blueprint. Les valeurs sensibles sont demandées par Render et ne figurent pas dans Git.

Au premier démarrage, les tables et le compte administrateur sont créés, et le contenu actuel de `lib/portfolio/initial-content.json` est importé. Connecte-toi sur `/admin`. L’initialisation est idempotente : les publications et le mot de passe existants ne sont pas écrasés lors d’un redéploiement. Pour changer le mot de passe d’un compte existant, utilise l’onglet Sécurité : modifier `ADMIN_INITIAL_PASSWORD` ne le réinitialise pas.

Si tu ajoutes un domaine personnalisé, modifie `APP_URL` avec cette origine exacte.

### Limites des offres gratuites

Render peut se mettre en veille en l’absence de trafic : la prochaine visite peut prendre plus de temps. Neon réactive automatiquement son calcul à la prochaine requête. Les offres gratuites restent soumises à leurs quotas. Les fichiers importés et le contenu ne dépendent pas du disque éphémère Render.

Documentation : [Render Free](https://render.com/docs/free), [Neon](https://neon.com/docs/get-started/connect-neon), [Cloudinary Upload](https://cloudinary.com/documentation/upload_images).

## Développement local

Node.js 24+ :

```sh
npm ci
npm run setup
npm run dev
```

Sans `DATABASE_URL`, le projet utilise SQLite dans `data/`. Les identifiants générés sont dans `data/admin-access.txt`, exclu de Git. Sans Cloudinary, les fichiers importés sont enregistrés dans `data/media/` pour le développement local.

Pour utiliser Neon en local, copie `.env.example` en `.env.local`, puis renseigne les accès. `npm run setup` et Next.js chargent ce fichier local. Ne mets jamais ces valeurs dans des variables `NEXT_PUBLIC_*`.

## Gestion du contenu

Le tableau de bord permet de gérer profil, coordonnées, CV, notes de compétences, groupes d’outils, formations, expériences, projets, expertises et prestations.

- **Enregistrer** conserve le brouillon.
- **Aperçu** affiche le brouillon privé.
- **Publier** met le contenu en ligne sans reconstruire le site.
- Une révision protège les modifications simultanées : un contenu obsolète est refusé.

Les projets confidentiels ne transmettent pas leurs captures au site public. Les sessions sont stockées sous forme de hash, avec cookies HttpOnly et SameSite. Les écritures vérifient l’origine `APP_URL`.

## Vérifier

```sh
npm run typecheck
npm run build
npm test
```

Les tests couvrent le serveur Next.js réel avec une base locale isolée, les migrations PostgreSQL avec PGlite, la limitation des connexions, la persistance, les conflits de publication et les envois Cloudinary signés (transport simulé, sans compte externe). Ils n’envoient rien vers tes comptes Neon ou Cloudinary.

## Fichiers importants

- `app/` : pages publiques, administration et routes backend.
- `lib/server/` : authentification, accès SQLite/PostgreSQL, contenu et stockage des médias.
- `lib/portfolio/initial-content.json` : contenu initial du portfolio.
- `public/` : visuels et documents livrés avec le site.
- `Dockerfile` et `render.yaml` : déploiement Render.
- `.env.example` : variables à configurer, sans secrets.

Le dossier `data/`, les fichiers `.env*` privés et les identifiants locaux sont exclus du dépôt et de l’image Docker.
