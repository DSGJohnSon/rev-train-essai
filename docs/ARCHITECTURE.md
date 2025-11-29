# Architecture Technique - Application de Révision d'Examen

## 📋 Vue d'ensemble du projet

Application Next.js 16 avec backoffice d'administration pour gérer des questions de révision d'examen. Interface moderne en dark mode avec MongoDB comme base de données.

## 🎯 Objectifs principaux

1. **Backoffice complet** : CRUD pour questions, catégories et types de catégories
2. **Authentification simple** : Protection par mot de passe unique
3. **Gestion d'images** : Upload local avec optimisation automatique (WebP, max 20KB)
4. **Historique** : Traçabilité et restauration des modifications
5. **Dashboard** : Statistiques et métriques du projet
6. **UX moderne** : Dark mode, responsive, skeletons de chargement

## 🏗️ Architecture technique

### Stack technologique

```
Frontend:
- Next.js 16 (App Router)
- React 19
- TypeScript
- Shadcn/ui (composants)
- Tailwind CSS 4
- Lucide React (icônes)

Backend:
- Next.js API Routes
- MongoDB (Atlas)
- Mongoose (ODM)

Gestion d'images:
- Sharp (optimisation)
- Stockage local (/public/uploads)
```

### Structure des dossiers

## 🎮 Interface Publique (V2)

### Routes publiques

```
app/(public)/
├── layout.tsx                      # Layout public (sans sidebar)
├── page.tsx                        # Page d'accueil
├── quiz/
│   ├── setup/
│   │   └── page.tsx               # Configuration quiz
│   ├── play/
│   │   └── page.tsx               # Session quiz
│   └── results/
│       └── page.tsx               # Résultats quiz
└── revision/
    ├── setup/
    │   └── page.tsx               # Configuration révision
    ├── play/
    │   └── page.tsx               # Session révision
    └── results/
        └── page.tsx               # Résultats révision
```

### Composants publics

```
components/public/
├── public-header.tsx              # Header avec lien admin
├── public-footer.tsx              # Footer simple
├── mode-selector.tsx              # Sélection mode (Quiz/Révision)
├── pseudonym-manager.tsx          # Gestion pseudonyme
├── category-selector.tsx          # Sélecteur 3 états
├── question-display.tsx           # Affichage question
├── answer-selector.tsx            # Sélection réponses
├── quiz-progress.tsx              # Progression quiz
├── revision-progress.tsx          # Progression révision
├── results-summary.tsx            # Résumé résultats
├── results-details.tsx            # Détails questions
├── save-score-dialog.tsx          # Dialog sauvegarde
└── exit-confirmation.tsx          # Confirmation sortie
```

```
rev-train-essai/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (backoffice)/
│   │   ├── layout.tsx              # Layout avec sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard statistiques
│   │   ├── questions/
│   │   │   ├── page.tsx            # Liste questions
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Créer question
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Voir/Éditer question
│   │   │       └── history/
│   │   │           └── page.tsx    # Historique modifications
│   │   ├── categories/
│   │   │   ├── page.tsx            # Liste catégories
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Créer catégorie
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Éditer catégorie
│   │   └── category-types/
│   │       ├── page.tsx            # Liste types
│   │       ├── new/
│   │       │   └── page.tsx        # Créer type
│   │       └── [id]/
│   │           └── page.tsx        # Éditer type
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   └── logout/
│   │   │       └── route.ts
│   │   ├── questions/
│   │   │   ├── route.ts            # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts        # GET, PUT, DELETE
│   │   │       └── history/
│   │   │           └── route.ts    # GET history, POST restore
│   │   ├── categories/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── category-types/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── upload/
│   │   │   └── route.ts            # Upload & optimize images
│   │   └── stats/
│   │       └── route.ts            # Dashboard statistics
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                    # Redirect to login or dashboard
├── components/
│   ├── ui/                         # Shadcn components
│   ├── backoffice/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── question-form.tsx
│   │   ├── category-form.tsx
│   │   ├── icon-picker.tsx         # Sélecteur d'icônes Lucide
│   │   ├── image-upload.tsx
│   │   ├── answer-builder.tsx      # Constructeur de réponses
│   │   └── history-viewer.tsx
│   └── shared/
│       ├── loading-skeleton.tsx
│       └── error-boundary.tsx
├── lib/
│   ├── mongodb.ts                  # Connexion MongoDB
│   ├── models/
│   │   ├── question.ts
│   │   ├── category.ts
│   │   ├── category-type.ts
│   │   ├── question-history.ts
│   │   └── session.ts              # Pour futures sessions quiz
│   ├── auth.ts                     # Gestion auth simple
│   ├── image-optimizer.ts          # Optimisation images
│   └── utils.ts
├── types/
│   ├── question.ts
│   ├── category.ts
│   └── api.ts
├── middleware.ts                   # Protection routes
├── public/
│   └── uploads/                    # Images uploadées
│       ├── questions/
│       └── answers/
└── docs/
    ├── ARCHITECTURE.md             # Ce document
    ├── TECHNICAL_DECISIONS.md      # Décisions techniques           
    └── IMPLEMENTATION_PLAN.md      # Plan d'implémentation V1
```

## 📊 Modèles de données MongoDB

### Collection: `categoryTypes`

```typescript
{
  _id: ObjectId,
  name: string,                    // "Lignes", "Engin Moteur", etc.
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `categories`

```typescript
{
  _id: ObjectId,
  name: string,                    // "Signalisation", "Freinage", etc.
  icon: string,                    // Nom icône Lucide: "AlertTriangle"
  categoryType: ObjectId,          // Référence vers categoryTypes
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `questions`

```typescript
{
  _id: ObjectId,
  title: string,                   // Intitulé de la question
  illustration?: string,           // Chemin image optionnelle
  answers: [
    {
      id: string,                  // "A", "B", "C", "D", "E", "F"
      type: "text" | "image" | "text-image",
      text?: string,
      image?: string,
      isCorrect: boolean
    }
  ],
  correctAnswers: string[],        // ["A", "C"] - IDs des réponses correctes
  categories: ObjectId[],          // Références vers categories
  createdAt: Date,
  updatedAt: Date,
  version: number                  // Pour historique
}
```

### Collection: `questionHistory`

```typescript
{
  _id: ObjectId,
  questionId: ObjectId,            // Référence vers question
  version: number,
  snapshot: Object,                // Copie complète de la question
  changeType: "created" | "updated" | "deleted",
  changedAt: Date,
  restoredFrom?: number            // Si restauré, version source
}
```

### Collection: `sessions` (pour futur)

```typescript
{
  _id: ObjectId,
  pseudonym: string,
  questionsAnswered: number,
  correctAnswers: number,
  categoryStats: [
    {
      categoryId: ObjectId,
      correct: number,
      total: number
    }
  ],
  completedAt: Date
}

### Collection: `quizSessions` (V2)

```typescript
{
  _id: ObjectId,
  pseudonym: string,
  mode: "quiz",
  score: {
    correct: number,
    total: number,
    percentage: number
  },
  settings: {
    questionCount: number,
    selectedCategories: ObjectId[],
    bannedCategories: ObjectId[]
  },
  results: [
    {
      questionId: ObjectId,
      questionTitle: string,
      userAnswers: string[],          // IDs réponses sélectionnées
      correctAnswers: string[],
      isCorrect: boolean,
      categories: ObjectId[]
    }
  ],
  duration: number,                   // En secondes
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `revisionSessions` (V2)

```typescript
{
  _id: ObjectId,
  pseudonym: string,
  mode: "revision",
  settings: {
    selectedCategories: ObjectId[]
  },
  stats: {
    totalAnswers: number,
    correctAnswers: number,
    incorrectAnswers: number,
    questionsValidated: number
  },
  duration: number,                   // En secondes
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```
```

## 🔐 Système d'authentification

### Approche simple avec cookies

```typescript
// Middleware protection
- Vérification cookie "auth-token"
- Token = hash(password + secret)
- Redirection vers /login si non authentifié
- Routes protégées: tout sous /(backoffice)/*
```

### Flow d'authentification

```mermaid
graph LR
    A[Utilisateur] --> B{Cookie valide?}
    B -->|Non| C[/login]
    C --> D[Saisie mot de passe]
    D --> E{Correct?}
    E -->|Oui| F[Set cookie]
    F --> G[/dashboard]
    E -->|Non| C
    B -->|Oui| G
```

## 🎨 Design System

### Palette de couleurs (Dark Mode)

```css
:root {
  --background: 224 71% 4%;        /* Noir profond */
  --foreground: 213 31% 91%;       /* Blanc cassé */
  --primary: 210 100% 50%;         /* Bleu vif */
  --primary-foreground: 222 47% 11%;
  --secondary: 222 47% 11%;        /* Gris foncé */
  --accent: 216 34% 17%;           /* Gris-bleu */
  --destructive: 0 63% 31%;        /* Rouge sombre */
  --border: 216 34% 17%;
  --input: 216 34% 17%;
  --ring: 210 100% 50%;
}
```

### Composants Shadcn/ui requis

```bash
# Installation des composants nécessaires
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add tabs
npx shadcn@latest add toast
npx shadcn@latest add skeleton
npx shadcn@latest add alert
npx shadcn@latest add separator
npx shadcn@latest add scroll-area
npx shadcn@latest add command
npx shadcn@latest add popover
```

## 🖼️ Gestion des images

### Workflow d'upload

```mermaid
graph TD
    A[Upload fichier] --> B{Validation}
    B -->|Type invalide| C[Erreur]
    B -->|OK| D[Sharp: Resize]

// Quiz (V2)
POST   /api/quiz/generate         // Générer quiz
POST   /api/quiz/sessions         // Sauvegarder session
GET    /api/quiz/sessions         // Récupérer sessions utilisateur

// Revision (V2)
POST   /api/revision/generate     // Générer révision
POST   /api/revision/sessions     // Sauvegarder session
GET    /api/revision/sessions     // Récupérer sessions utilisateur

// Public (V2)
GET    /api/public/stats          // Statistiques publiques
GET    /api/public/categories     // Catégories publiques
    D --> E[Conversion WebP]
    E --> F{Taille > 20KB?}
    F -->|Oui| G[Réduire qualité]
    G --> F
    F -->|Non| H[Sauvegarder /public/uploads]
    H --> I[Retourner chemin]
```

### Configuration Sharp

```typescript
// Optimisation automatique
- Format: WebP
- Max width: 1200px
- Max height: 800px
- Quality: 80 (ajusté si > 20KB)
- Compression: lossy
```

## 📱 Responsive Design

### Breakpoints

```typescript
// Tailwind breakpoints
sm: 640px   // Mobile landscape
md: 768px   // Tablet portrait
lg: 1024px  // Tablet landscape
xl: 1280px  // Desktop
2xl: 1536px // Large desktop
```

### Adaptations par device

**Mobile (< 768px)**
- Sidebar en drawer/modal
- Tables en cards empilées
- Formulaires full-width
- Images responsive

**Tablet (768px - 1024px)**
- Sidebar collapsible
- Tables scrollables
- Formulaires 2 colonnes

**Desktop (> 1024px)**
- Sidebar fixe
- Tables complètes
- Formulaires optimisés

## 🔄 États de chargement

### Stratégie de skeletons

```typescript
// Composants avec loading states
- QuestionList: Skeleton cards
- CategoryList: Skeleton table rows
- Dashboard: Skeleton stats cards
- Forms: Disabled state pendant save
- Images: Placeholder pendant upload
```

## 🚀 API Routes

### Endpoints principaux

```typescript
// Questions
GET    /api/questions              // Liste avec filtres
POST   /api/questions              // Créer
GET    /api/questions/[id]         // Détails
PUT    /api/questions/[id]         // Modifier
DELETE /api/questions/[id]         // Supprimer
GET    /api/questions/[id]/history // Historique
POST   /api/questions/[id]/history // Restaurer version

// Categories
GET    /api/categories             // Liste
POST   /api/categories             // Créer
GET    /api/categories/[id]        // Détails
PUT    /api/categories/[id]        // Modifier
DELETE /api/categories/[id]        // Supprimer

// Category Types
GET    /api/category-types         // Liste
POST   /api/category-types         // Créer
GET    /api/category-types/[id]    // Détails
PUT    /api/category-types/[id]    // Modifier
DELETE /api/category-types/[id]    // Supprimer

// Upload
POST   /api/upload                 // Upload image

// Stats
GET    /api/stats                  // Dashboard statistics

// Auth
POST   /api/auth/login             // Login
POST   /api/auth/logout            // Logout
```

## 📦 Dépendances à ajouter

```json
{
  "dependencies": {
    "mongodb": "^6.3.0",
    "mongoose": "^8.0.0",
    "sharp": "^0.33.0",
    "bcryptjs": "^2.4.3",
    "jose": "^5.2.0",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^3.0.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

## 🎯 Fonctionnalités clés

### 1. Sélecteur d'icônes Lucide

```typescript
// Composant IconPicker
- Affichage grille d'icônes
- Recherche par nom
- Preview en temps réel
- Catégorisation des icônes
```

### 2. Constructeur de réponses

```typescript
// Composant AnswerBuilder
- Ajout dynamique de réponses (max 6)
- Choix type: texte/image/mixte
- Upload d'images par réponse
- Sélection réponses correctes
- Validation: min 1 correcte, min 1 incorrecte
```

### 3. Historique des modifications

```typescript
// Fonctionnalités
- Sauvegarde automatique à chaque modification
- Affichage timeline des versions
- Comparaison visuelle (diff)
- Restauration en un clic
- Indication version actuelle
```

### 4. Dashboard statistiques

```typescript
// Métriques affichées
- Nombre total de questions
- Répartition par catégorie (graphique)
- Répartition par type de catégorie
- Questions récentes
- Statistiques sessions (futur)
```

## 🔒 Sécurité

### Mesures de protection

```typescript
// Authentification
- Cookie httpOnly
- Token avec expiration
- Middleware sur toutes routes backoffice

// Upload
- Validation type MIME
- Limite taille fichier (5MB max avant optimisation)
- Sanitization noms fichiers
- Stockage hors /public en production

// API
- Validation Zod sur tous inputs
- Rate limiting (futur)
- CORS configuration
```

## 🧪 Validation des données

### Schémas Zod

```typescript
// Question
- title: min 10 chars, max 500
- answers: min 2, max 6
- correctAnswers: min 1
- categories: min 1

// Category
- name: min 2 chars, max 100
- icon: valid Lucide icon name
- categoryType: valid ObjectId

// CategoryType
- name: min 2 chars, max 50
```

## 📈 Performance

### Optimisations

```typescript
// Images
- Lazy loading
- WebP format
- Compression automatique
- CDN ready (futur)

// Database
- Indexes sur champs recherchés
- Pagination des listes
- Projection des champs nécessaires

// Frontend
- React Server Components
- Streaming SSR
- Code splitting automatique
- Prefetching navigation
```

## 🎨 UX/UI Détails

### Navigation Sidebar

```typescript
// Structure
- Logo/Titre app
- Dashboard (icône Home)
- Questions (icône FileQuestion)
- Catégories (icône FolderTree)
- Types de catégories (icône Tags)
- Déconnexion (icône LogOut)

// États
- Item actif: background accent
- Hover: background subtle
- Compteurs: badges
```

### Formulaire Question

```typescript
// Sections
1. Informations générales
   - Titre (textarea)
   - Image illustration (upload optionnel)

2. Réponses
   - Liste dynamique
   - Bouton "Ajouter réponse" (max 6)
   - Pour chaque réponse:
     * ID auto (A, B, C...)
     * Type selector
     * Champs selon type
     * Checkbox "Correcte"
     * Bouton supprimer

3. Catégories
   - Multi-select avec recherche
   - Affichage avec icônes
   - Groupées par type

4. Actions
   - Bouton "Enregistrer"
   - Bouton "Annuler"
   - Loading state
```

### Liste Questions

```typescript
// Affichage
- Table responsive
- Colonnes: Titre, Catégories, Réponses, Date, Actions
- Filtres: Catégorie, Type, Recherche
- Pagination
- Actions: Voir, Éditer, Historique, Supprimer

// Mobile
- Cards empilées
- Swipe actions
```

## 🔄 Workflow de développement

### Ordre d'implémentation

1. **Setup infrastructure** (Phase 1)
   - Configuration MongoDB
   - Installation dépendances
   - Configuration Next.js

2. **Modèles et DB** (Phase 2)
   - Schémas Mongoose
   - Connexion MongoDB
   - Seed data initial

3. **Authentification** (Phase 3)
   - Page login
   - API auth
   - Middleware protection

4. **Structure backoffice** (Phase 4)
   - Layout avec sidebar
   - Navigation
   - Dashboard basique

5. **CRUD Types** (Phase 5)
   - Liste, création, édition
   - Validation
   - API routes

6. **CRUD Catégories** (Phase 6)
   - Formulaires
   - Sélecteur icônes
   - API routes

7. **CRUD Questions** (Phase 7)
   - Formulaire complexe
   - Upload images
   - Constructeur réponses
   - API routes

8. **Historique** (Phase 8)
   - Sauvegarde versions
   - Interface historique
   - Restauration

9. **Dashboard** (Phase 9)
   - Statistiques
   - Graphiques
   - Métriques

10. **Polish** (Phase 10)
    - Responsive final
    - Skeletons
    - Optimisations
    - Tests

## 🎯 Critères de succès

### Fonctionnels
- ✅ CRUD complet pour tous les modèles
- ✅ Upload et optimisation images
- ✅ Historique avec restauration
- ✅ Dashboard avec stats
- ✅ Authentification fonctionnelle

### Techniques
- ✅ Responsive mobile/tablet/desktop
- ✅ Dark mode complet
- ✅ Skeletons de chargement
- ✅ Validation des données
- ✅ Gestion erreurs

### UX
- ✅ Interface intuitive
- ✅ Feedback utilisateur
- ✅ Performance fluide
- ✅ Accessibilité basique

## 📝 Notes importantes

### Limitations connues

```typescript
// Production (Vercel)
- Upload images désactivé
- Utiliser service externe (Cloudinary) si besoin
- Variables d'environnement requises

// Développement
- Images stockées localement
- MongoDB Atlas requis
- Node.js 18+ requis
```

### Variables d'environnement

```env
# .env.local
MONGODB_URI=mongodb+srv://persodsgjohnson_db_user:b2P2yKuwvmfppAU3@cluster0.t4lnuiy.mongodb.net/?appName=Cluster0
ADMIN_PASSWORD=DreamTeam@2024
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Prochaines étapes

Après validation de cette architecture, nous procéderons à l'implémentation phase par phase, en commençant par la configuration de base et les modèles de données.

---

**Version**: 1.0  
**Date**: 2025-11-29  
**Auteur**: Kilo Code (Architect Mode)
**Version**: 2.0  
**Date**: 2025-11-29  
**Dernière mise à jour**: 2025-11-29 (V2 - Interface Publique)  
**Auteur**: Kilo Code

---
