# GeoMood

GeoMood est une application de suivi d'humeur qui combine la géolocalisation avec l'analyse émotionnelle, offrant des insights sur comment votre localisation affecte votre humeur.

## Description du Projet

GeoMood permet aux utilisateurs de :
- Enregistrer leur humeur avec leur position géographique
- Visualiser leurs humeurs sur une carte interactive
- Obtenir des analyses d'humeur générées par IA
- Corréler leur humeur avec les conditions météorologiques locales
- Consulter l'historique et les statistiques de leurs humeurs

## Installation

### Prérequis

- Node.js >= 18
- npm >= 9
- Docker et Docker Compose (pour l'exécution avec conteneurs)

### Configuration des Variables d'Environnement

#### Backend (`packages/server/.env`)

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=mongodb://localhost:27017/geomoodmap
DATABASE_NAME=geomoodmap

WEATHER_API_KEY=your_weather_api_key
GEMINI_API_KEY=your_gemini_api_key
```

#### Frontend (`packages/www/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Installation des Dépendances

```bash
npm install
```

## Exécution

### Option 1: Développement Local (sans Docker)

1. Démarrer MongoDB localement
2. Lancer les deux applications :

```bash
# Tout en une fois
npm run dev

# Ou séparément
npm run dev:server  # Backend sur http://localhost:3000
npm run dev:www     # Frontend sur http://localhost:5173
```

### Option 2: Avec Docker Compose (Recommandé)

```bash
docker-compose up
```

Services disponibles :
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **MongoDB**: localhost:27017

## Structure du Projet

```
geomood/
├── packages/
│   ├── server/              # Backend NestJS
│   │   └── src/
│   │       ├── application/    # Cas d'usage
│   │       ├── domain/         # Logique métier & entités
│   │       ├── infrastructure/ # Adaptateurs externes (DB, APIs)
│   │       ├── ports/          # Interfaces/contrats
│   │       └── shared/         # Utilitaires partagés
│   └── www/                 # Frontend Vue 3
│       └── src/
│           ├── components/
│           ├── views/
│           ├── stores/
│           └── router/
├── docs/                    # Documentation et schémas
├── Dockerfile.server        # Image Docker backend
├── Dockerfile.www           # Image Docker frontend
└── docker-compose.yml       # Orchestration des services
```

## Architecture

Le projet suit une **architecture hexagonale** (ports et adaptateurs) pour le backend, garantissant :
- Séparation claire des responsabilités
- Indépendance vis-à-vis des frameworks
- Facilité de test
- Maintenabilité à long terme

### Principes d'Architecture

#### Backend (Hexagonal Architecture)

- **Domain**: Entités métier et logique pure (User, Mood)
- **Application**: Cas d'usage orchestrant la logique métier
- **Ports**: Interfaces définissant les contrats (repositories, services externes)
- **Infrastructure**: Implémentations concrètes (MongoDB, API météo, Gemini AI)

#### Frontend (Modular Architecture)

- **Components**: Composants Vue réutilisables
- **Views**: Pages de l'application
- **Stores**: Gestion d'état avec Pinia
- **Router**: Navigation de l'application
- **Services**: Communication avec l'API backend

## Sources API Utilisées

### 1. Weather API
- **Description**: Fournit les données météorologiques en temps réel
- **Usage**: Corrélation entre l'humeur de l'utilisateur et les conditions météo
- **Configuration**: `WEATHER_API_KEY` dans `packages/server/.env`

### 2. Google Gemini AI
- **Description**: Modèle d'IA générative pour l'analyse d'humeur
- **Usage**: Génération d'insights et d'analyses contextuelles sur les humeurs
- **Configuration**: `GEMINI_API_KEY` dans `packages/server/.env`
- **Documentation**: https://ai.google.dev/

## Stack Technologique

### Backend
- **Framework**: NestJS
- **Database**: MongoDB avec Mongoose
- **AI**: Google Generative AI (Gemini)
- **Testing**: Vitest
- **Validation**: class-validator, class-transformer

### Frontend
- **Framework**: Vue 3 avec TypeScript
- **Build**: Vite
- **UI**: PrimeVue
- **Maps**: Leaflet
- **State**: Pinia
- **Validation**: VeeValidate

## Scripts Disponibles

```bash
# Développement
npm run dev              # Démarrer backend + frontend
npm run dev:server       # Démarrer uniquement backend
npm run dev:www          # Démarrer uniquement frontend

# Build
npm run build            # Build backend + frontend

# Tests
npm test                 # Lancer les tests backend

# Qualité de code
npm run lint             # Linter avec Biome
```

## Documentation Complète

Pour plus de détails, consultez la [documentation complète](docs/README.md).

## License

ISC
