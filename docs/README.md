# GeoMood - Documentation Technique

Cette documentation fournit des détails techniques approfondis sur l'architecture et l'implémentation de GeoMood.

## Table des Matières

1. [Architecture Hexagonale](#architecture-hexagonale)
2. [Schémas de l'Architecture](#schémas-de-larchitecture)
3. [Flux de Données](#flux-de-données)
4. [APIs Externes](#apis-externes)
5. [Modèle de Données](#modèle-de-données)

## Architecture Hexagonale

Le backend de GeoMood suit les principes de l'architecture hexagonale (Ports & Adapters), également appelée Clean Architecture.

### Principes Fondamentaux

1. **Indépendance des frameworks**: La logique métier ne dépend pas de NestJS
2. **Testabilité**: Chaque couche peut être testée indépendamment
3. **Indépendance de l'UI**: Le frontend peut être remplacé sans modifier le métier
4. **Indépendance de la base de données**: MongoDB peut être remplacé par une autre DB
5. **Indépendance des services externes**: Les APIs externes sont facilement mockables

### Couches de l'Application

```
┌─────────────────────────────────────────────────────────────┐
│                     Infrastructure                          │
│  (Controllers, MongoDB, Weather API, Gemini AI)             │
├─────────────────────────────────────────────────────────────┤
│                         Ports                               │
│         (Interfaces & Contracts)                            │
├─────────────────────────────────────────────────────────────┤
│                      Application                            │
│              (Use Cases / Services)                         │
├─────────────────────────────────────────────────────────────┤
│                        Domain                               │
│            (Business Logic & Entities)                      │
└─────────────────────────────────────────────────────────────┘
```

#### 1. Domain (Cœur Métier)

**Responsabilité**: Logique métier pure, entités, règles de gestion

**Contenu**:
- `entities/`: User, Mood
- `value-objects/`: Location, MoodType
- Logique métier sans dépendances externes

**Règles**:
- Aucune dépendance vers les autres couches
- Pas d'imports de frameworks
- Code testable avec des tests unitaires purs

#### 2. Application (Cas d'Usage)

**Responsabilité**: Orchestration de la logique métier

**Contenu**:
- `use-cases/`: CreateMoodUseCase, GetUserMoodsUseCase, etc.
- Coordination entre le domain et les ports

**Règles**:
- Dépend uniquement du Domain et des Ports
- Implémente les cas d'usage métier
- Indépendant des détails techniques

#### 3. Ports (Interfaces)

**Responsabilité**: Contrats entre Application et Infrastructure

**Contenu**:
- `repositories/`: IUserRepository, IMoodRepository
- `services/`: IWeatherService, IAIService
- Interfaces définissant les contrats

**Règles**:
- Définit QUOI faire, pas COMMENT
- Permet l'inversion de dépendance
- Facilite le mocking pour les tests

#### 4. Infrastructure (Adaptateurs)

**Responsabilité**: Implémentation concrète des ports

**Contenu**:
- `repositories/`: MongoUserRepository, MongoMoodRepository
- `services/`: WeatherApiService, GeminiAIService
- `controllers/`: REST API endpoints
- `modules/`: Configuration NestJS

**Règles**:
- Implémente les interfaces définies dans Ports
- Gère les détails techniques (DB, API, HTTP)
- Seule couche dépendante des frameworks

## Schémas de l'Architecture

### Architecture Globale du Système

```
┌──────────────┐
│   Frontend   │
│   (Vue 3)    │
└──────┬───────┘
       │ HTTP/REST
       │
┌──────▼────────────────────────────────────────────────────┐
│                    Backend (NestJS)                       │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │           Infrastructure Layer                   │    │
│  │  ┌────────────┐  ┌──────────┐  ┌─────────────┐  │    │
│  │  │Controllers │  │MongoDB   │  │External APIs│  │    │
│  │  └─────┬──────┘  └────┬─────┘  └──────┬──────┘  │    │
│  └────────┼──────────────┼───────────────┼─────────┘    │
│           │              │               │               │
│  ┌────────▼──────────────▼───────────────▼─────────┐    │
│  │              Application Layer                  │    │
│  │         (Use Cases / Business Logic)            │    │
│  └────────┬────────────────────────────────────────┘    │
│           │                                              │
│  ┌────────▼────────────────────────────────────────┐    │
│  │              Domain Layer                       │    │
│  │        (Entities & Business Rules)              │    │
│  └─────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────┘
       │                           │
       ▼                           ▼
┌─────────────┐           ┌──────────────────┐
│   MongoDB   │           │  External APIs   │
│             │           │ - Weather API    │
│             │           │ - Gemini AI      │
└─────────────┘           └──────────────────┘
```

### Flux d'une Requête (Exemple: Créer un Mood)

```
1. User clicks → Frontend (Vue)
                    │
2. HTTP POST /moods │
                    ▼
3. Controller (Infrastructure)
    - Valide la requête
    - Transforme en DTO
                    │
                    ▼
4. CreateMoodUseCase (Application)
    - Vérifie l'utilisateur existe
    - Récupère la météo
    - Génère analyse IA
    - Crée l'entité Mood
                    │
                    ▼
5. MoodRepository Port (Interface)
                    │
                    ▼
6. MongoMoodRepository (Infrastructure)
    - Sauvegarde dans MongoDB
                    │
                    ▼
7. Response ← Controller
                    │
                    ▼
8. JSON Response → Frontend
```

## Flux de Données

### Création d'un Mood avec Contexte

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Submit mood + location
     ▼
┌─────────────────┐
│   Frontend      │
│  - Geolocation  │
│  - Form data    │
└────┬────────────┘
     │
     │ 2. POST /api/v1/moods
     │    { mood, lat, lng, note }
     ▼
┌─────────────────────────────────────────┐
│         Backend Controller              │
│  - Validation (DTO)                     │
│  - Extract user from JWT                │
└────┬────────────────────────────────────┘
     │
     │ 3. Execute use case
     ▼
┌─────────────────────────────────────────┐
│      CreateMoodUseCase                  │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ a. Get Weather Data               │ │
│  │    WeatherService.getByCoords()   │◄┼──→ Weather API
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ b. Generate AI Analysis           │ │
│  │    AIService.analyzeMood()        │◄┼──→ Gemini AI
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ c. Create Mood Entity             │ │
│  │    new Mood(data)                 │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ d. Save to Repository             │ │
│  │    MoodRepository.save()          │◄┼──→ MongoDB
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
     │
     │ 4. Return saved mood
     ▼
┌─────────────────┐
│   Frontend      │
│  - Update UI    │
│  - Show on map  │
└─────────────────┘
```

## APIs Externes

### 1. Weather API

**Purpose**: Obtenir les conditions météorologiques actuelles pour une localisation

**Configuration**:
```env
WEATHER_API_KEY=your_api_key
```

**Utilisation dans le Code**:
```typescript
// Port (Interface)
export interface IWeatherService {
  getWeatherByCoords(lat: number, lng: number): Promise<WeatherData>;
}

// Infrastructure (Implementation)
export class WeatherApiService implements IWeatherService {
  async getWeatherByCoords(lat: number, lng: number) {
    // Call to external Weather API
  }
}
```

**Données Récupérées**:
- Température
- Conditions météo (ensoleillé, pluvieux, etc.)
- Humidité
- Vitesse du vent

### 2. Google Gemini AI

**Purpose**: Analyser les humeurs et générer des insights contextuels

**Configuration**:
```env
GEMINI_API_KEY=your_api_key
```

**Documentation**: https://ai.google.dev/

**Utilisation dans le Code**:
```typescript
// Port (Interface)
export interface IAIService {
  analyzeMood(mood: MoodData, weather: WeatherData): Promise<string>;
}

// Infrastructure (Implementation)
export class GeminiAIService implements IAIService {
  async analyzeMood(mood: MoodData, weather: WeatherData) {
    // Call to Gemini AI API
  }
}
```

**Cas d'Usage**:
- Génération d'insights basés sur l'humeur et le contexte
- Corrélation entre météo et humeur
- Suggestions personnalisées

## Modèle de Données

### User Entity (Domain)

```typescript
class UserEntity {
  id: string;
  email: string;
  moods: MoodVO[];
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Mood Value Object (Domain)

```typescript
class MoodVO {
  textContent: string;     // Description de l'humeur (max 1000 caractères)
  rating: number;          // Note de 1 à 5
  location: Location;      // { lat: number, lng: number }
  weather: Weather;        // Données météo
  picture?: string;        // Image optionnelle
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Location Value Object

```typescript
class Location {
  lat: number;   // Latitude (-90 à 90)
  lng: number;   // Longitude (-180 à 180)
}
```

### Weather Value Object

```typescript
class Weather {
  temperature: number;
  condition: string;
  humidity: number;
  pressure: number;
  windSpeed: number;
}
```

### Database Schema (MongoDB)

Les moods sont stockés comme **documents imbriqués** dans la collection Users (approche dénormalisée).

```javascript
// Users Collection
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  moods: [
    {
      textContent: String (max 1000 chars),
      rating: Number (1-5),
      location: {
        lat: Number,
        lng: Number
      },
      weather: {
        temperature: Number,
        condition: String,
        humidity: Number,
        pressure: Number,
        windSpeed: Number
      },
      picture: String (optional),
      createdAt: Date,
      updatedAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}

// Index
db.users.createIndex({ "moods.createdAt": -1 })  // Pour les requêtes par date
```

## Tests

### Structure des Tests

```
packages/server/test/
├── unit/
│   ├── domain/          # Tests des entités et logique métier
│   ├── application/     # Tests des use cases
│   └── infrastructure/  # Tests des adaptateurs
└── integration/         # Tests d'intégration
```

### Stratégie de Test

1. **Domain**: Tests unitaires purs (pas de dépendances)
2. **Application**: Tests avec mocks des repositories et services
3. **Infrastructure**: Tests d'intégration avec MongoDB in-memory
