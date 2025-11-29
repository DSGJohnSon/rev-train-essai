# Plan d'Implémentation Détaillé - Application de Révision

## 🎯 Vue d'ensemble

Ce document détaille le plan d'implémentation phase par phase pour créer l'application de révision d'examen avec backoffice d'administration.

**Durée estimée totale**: 10 phases
**Architecture complète**: Voir [`ARCHITECTURE.md`](ARCHITECTURE.md)

---

## 📋 Phase 1: Configuration et infrastructure de base

### Objectifs
- Installer toutes les dépendances nécessaires
- Configurer MongoDB et les variables d'environnement
- Mettre en place la structure de dossiers
- Configurer Next.js pour l'upload d'images

### Tâches détaillées

#### 1.1 Installation des dépendances
```bash
pnpm add mongodb mongoose sharp bcryptjs jose zod react-hook-form @hookform/resolvers date-fns recharts
pnpm add -D @types/bcryptjs
```

#### 1.2 Installation composants Shadcn/ui
```bash
npx shadcn@latest add button input label textarea select checkbox radio-group dialog dropdown-menu table card badge tabs toast skeleton alert separator scroll-area command popover
```

#### 1.3 Configuration Next.js
- Modifier [`next.config.ts`](next.config.ts) pour autoriser les images locales
- Ajouter configuration pour les uploads
- Configurer les variables d'environnement

#### 1.4 Création structure de dossiers
```
app/
├── (auth)/login/
├── (backoffice)/
│   ├── dashboard/
│   ├── questions/
│   ├── categories/
│   └── category-types/
├── api/
│   ├── auth/
│   ├── questions/
│   ├── categories/
│   ├── category-types/
│   ├── upload/
│   └── stats/
components/
├── ui/
├── backoffice/
└── shared/
lib/
├── models/
types/
public/uploads/
```

#### 1.5 Variables d'environnement
Créer `.env.local`:
```env
MONGODB_URI=mongodb+srv://persodsgjohnson_db_user:b2P2yKuwvmfppAU3@cluster0.t4lnuiy.mongodb.net/?appName=Cluster0
ADMIN_PASSWORD=DreamTeam@2024
JWT_SECRET=super-secret-key-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Livrables
- ✅ Toutes dépendances installées
- ✅ Structure de dossiers créée
- ✅ Configuration Next.js mise à jour
- ✅ Variables d'environnement configurées

---

## 📋 Phase 2: Modèles de données et connexion MongoDB

### Objectifs
- Établir la connexion MongoDB
- Créer tous les schémas Mongoose
- Créer les types TypeScript
- Tester la connexion

### Tâches détaillées

#### 2.1 Connexion MongoDB
Créer [`lib/mongodb.ts`](lib/mongodb.ts):
- Singleton de connexion
- Gestion du cache
- Gestion des erreurs

#### 2.2 Schémas Mongoose

**[`lib/models/category-type.ts`](lib/models/category-type.ts)**
```typescript
- name: String (required, unique)
- createdAt, updatedAt: Date
```

**[`lib/models/category.ts`](lib/models/category.ts)**
```typescript
- name: String (required)
- icon: String (required, Lucide icon name)
- categoryType: ObjectId (ref: CategoryType)
- createdAt, updatedAt: Date
```

**[`lib/models/question.ts`](lib/models/question.ts)**
```typescript
- title: String (required, min 10, max 500)
- illustration: String (optional)
- answers: Array (min 2, max 6)
  - id: String (A-F)
  - type: Enum (text, image, text-image)
  - text: String (optional)
  - image: String (optional)
  - isCorrect: Boolean
- correctAnswers: Array of String
- categories: Array of ObjectId (ref: Category)
- version: Number
- createdAt, updatedAt: Date
```

**[`lib/models/question-history.ts`](lib/models/question-history.ts)**
```typescript
- questionId: ObjectId (ref: Question)
- version: Number
- snapshot: Mixed (copie complète)
- changeType: Enum (created, updated, deleted)
- changedAt: Date
- restoredFrom: Number (optional)
```

**[`lib/models/session.ts`](lib/models/session.ts)** (pour futur)
```typescript
- pseudonym: String
- questionsAnswered: Number
- correctAnswers: Number
- categoryStats: Array
- completedAt: Date
```

#### 2.3 Types TypeScript

**[`types/question.ts`](types/question.ts)**
```typescript
export type AnswerType = 'text' | 'image' | 'text-image';
export type AnswerId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface Answer {
  id: AnswerId;
  type: AnswerType;
  text?: string;
  image?: string;
  isCorrect: boolean;
}

export interface Question {
  _id: string;
  title: string;
  illustration?: string;
  answers: Answer[];
  correctAnswers: AnswerId[];
  categories: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**[`types/category.ts`](types/category.ts)**
```typescript
export interface CategoryType {
  _id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  icon: string;
  categoryType: string | CategoryType;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.4 Seed data initial
Créer script pour insérer les 4 types de catégories par défaut:
- Lignes
- Engin Moteur
- Anomalies
- Autres

### Livrables
- ✅ Connexion MongoDB fonctionnelle
- ✅ Tous les modèles Mongoose créés
- ✅ Types TypeScript définis
- ✅ Seed data des types de catégories

---

## 📋 Phase 3: Système d'authentification simple

### Objectifs
- Créer la page de login
- Implémenter l'API d'authentification
- Créer le middleware de protection
- Gérer les cookies de session

### Tâches détaillées

#### 3.1 Utilitaires d'authentification
Créer [`lib/auth.ts`](lib/auth.ts):
- Fonction `hashPassword()`
- Fonction `verifyPassword()`
- Fonction `createToken()`
- Fonction `verifyToken()`
- Fonction `getSession()`

#### 3.2 Page de login
Créer [`app/(auth)/login/page.tsx`](app/(auth)/login/page.tsx):
- Formulaire avec champ mot de passe
- Design dark mode moderne
- Validation côté client
- Gestion des erreurs
- Redirection après succès

#### 3.3 API Routes d'authentification

**[`app/api/auth/login/route.ts`](app/api/auth/login/route.ts)**
- POST: Vérifier mot de passe
- Créer token JWT
- Set cookie httpOnly
- Retourner succès/erreur

**[`app/api/auth/logout/route.ts`](app/api/auth/logout/route.ts)**
- POST: Supprimer cookie
- Retourner succès

#### 3.4 Middleware de protection
Créer [`middleware.ts`](middleware.ts):
- Vérifier token sur routes `/(backoffice)/*`
- Rediriger vers `/login` si non authentifié
- Permettre accès aux routes publiques

#### 3.5 Page d'accueil
Modifier [`app/page.tsx`](app/page.tsx):
- Rediriger vers `/dashboard` si authentifié
- Rediriger vers `/login` sinon

### Livrables
- ✅ Page login fonctionnelle
- ✅ Authentification par mot de passe
- ✅ Protection des routes backoffice
- ✅ Gestion de session

---

## 📋 Phase 4: Structure du backoffice et navigation

### Objectifs
- Créer le layout du backoffice avec sidebar
- Implémenter la navigation
- Créer le header
- Mettre en place le dashboard basique

### Tâches détaillées

#### 4.1 Layout backoffice
Créer [`app/(backoffice)/layout.tsx`](app/(backoffice)/layout.tsx):
- Structure avec sidebar fixe (desktop)
- Drawer mobile
- Header avec titre et déconnexion
- Zone de contenu principale

#### 4.2 Composant Sidebar
Créer [`components/backoffice/sidebar.tsx`](components/backoffice/sidebar.tsx):
- Logo/Titre application
- Navigation items:
  - Dashboard (Home icon)
  - Questions (FileQuestion icon)
  - Catégories (FolderTree icon)
  - Types de catégories (Tags icon)
- Bouton déconnexion (LogOut icon)
- État actif sur item courant
- Responsive (drawer sur mobile)

#### 4.3 Composant Header
Créer [`components/backoffice/header.tsx`](components/backoffice/header.tsx):
- Titre de la page courante
- Bouton menu mobile
- Bouton déconnexion
- Breadcrumb (optionnel)

#### 4.4 Dashboard basique
Créer [`app/(backoffice)/dashboard/page.tsx`](app/(backoffice)/dashboard/page.tsx):
- Cards avec statistiques basiques:
  - Nombre total de questions
  - Nombre de catégories
  - Nombre de types
- Design moderne avec icônes
- Skeletons de chargement

#### 4.5 Composants UI partagés
Créer [`components/shared/loading-skeleton.tsx`](components/shared/loading-skeleton.tsx):
- Skeletons réutilisables
- Variants: card, table, form

### Livrables
- ✅ Layout backoffice complet
- ✅ Navigation fonctionnelle
- ✅ Dashboard avec stats basiques
- ✅ Responsive mobile/desktop

---

## 📋 Phase 5: CRUD Types de catégories

### Objectifs
- Créer l'interface de gestion des types
- Implémenter le CRUD complet
- Ajouter validation et gestion d'erreurs

### Tâches détaillées

#### 5.1 API Routes

**[`app/api/category-types/route.ts`](app/api/category-types/route.ts)**
- GET: Liste tous les types
- POST: Créer un nouveau type
- Validation Zod
- Gestion erreurs

**[`app/api/category-types/[id]/route.ts`](app/api/category-types/[id]/route.ts)**
- GET: Détails d'un type
- PUT: Modifier un type
- DELETE: Supprimer un type (vérifier pas de catégories liées)

#### 5.2 Page liste
Créer [`app/(backoffice)/category-types/page.tsx`](app/(backoffice)/category-types/page.tsx):
- Table avec colonnes: Nom, Date création, Actions
- Bouton "Nouveau type"
- Actions: Éditer, Supprimer
- Confirmation avant suppression
- Skeletons de chargement

#### 5.3 Page création
Créer [`app/(backoffice)/category-types/new/page.tsx`](app/(backoffice)/category-types/new/page.tsx):
- Formulaire simple:
  - Champ nom (required)
- Validation
- Boutons: Enregistrer, Annuler
- Toast de succès/erreur

#### 5.4 Page édition
Créer [`app/(backoffice)/category-types/[id]/page.tsx`](app/(backoffice)/category-types/[id]/page.tsx):
- Même formulaire que création
- Pré-rempli avec données existantes
- Mise à jour au lieu de création

#### 5.5 Validation Zod
Créer schémas de validation:
```typescript
const categoryTypeSchema = z.object({
  name: z.string().min(2).max(50)
});
```

### Livrables
- ✅ CRUD complet pour types de catégories
- ✅ Validation des données
- ✅ Interface utilisateur intuitive
- ✅ Gestion des erreurs

---

## 📋 Phase 6: CRUD Catégories avec sélecteur d'icônes

### Objectifs
- Créer le sélecteur d'icônes Lucide
- Implémenter le CRUD des catégories
- Lier aux types de catégories

### Tâches détaillées

#### 6.1 Composant IconPicker
Créer [`components/backoffice/icon-picker.tsx`](components/backoffice/icon-picker.tsx):
- Grille d'icônes Lucide
- Recherche par nom
- Preview de l'icône sélectionnée
- Dialog/Popover pour sélection
- Liste des icônes populaires:
  - AlertTriangle, Car, Wrench, Flag, etc.

#### 6.2 API Routes

**[`app/api/categories/route.ts`](app/api/categories/route.ts)**
- GET: Liste avec populate du type
- POST: Créer catégorie
- Validation: nom, icône, type

**[`app/api/categories/[id]/route.ts`](app/api/categories/[id]/route.ts)**
- GET: Détails avec populate
- PUT: Modifier
- DELETE: Supprimer (vérifier pas de questions liées)

#### 6.3 Page liste
Créer [`app/(backoffice)/categories/page.tsx`](app/(backoffice)/categories/page.tsx):
- Table avec colonnes:
  - Icône (preview)
  - Nom
  - Type
  - Date création
  - Actions
- Filtres par type
- Bouton "Nouvelle catégorie"
- Skeletons

#### 6.4 Formulaire catégorie
Créer [`components/backoffice/category-form.tsx`](components/backoffice/category-form.tsx):
- Champ nom
- Sélecteur d'icône (IconPicker)
- Select type de catégorie
- Preview de la catégorie
- Validation

#### 6.5 Pages création/édition
Créer [`app/(backoffice)/categories/new/page.tsx`](app/(backoffice)/categories/new/page.tsx)
Créer [`app/(backoffice)/categories/[id]/page.tsx`](app/(backoffice)/categories/[id]/page.tsx):
- Utiliser CategoryForm
- Gestion création/édition

### Livrables
- ✅ Sélecteur d'icônes fonctionnel
- ✅ CRUD complet pour catégories
- ✅ Liaison avec types
- ✅ Interface intuitive

---

## 📋 Phase 7: CRUD Questions avec gestion d'images

### Objectifs
- Créer le système d'upload d'images
- Implémenter le constructeur de réponses
- Créer le CRUD complet des questions
- Gérer la complexité du formulaire

### Tâches détaillées

#### 7.1 Optimisation d'images
Créer [`lib/image-optimizer.ts`](lib/image-optimizer.ts):
- Fonction `optimizeImage()` avec Sharp
- Conversion WebP
- Resize max 1200x800
- Compression jusqu'à 20KB max
- Retour du chemin sauvegardé

#### 7.2 API Upload
Créer [`app/api/upload/route.ts`](app/api/upload/route.ts):
- POST: Upload fichier
- Validation type (image uniquement)
- Optimisation automatique
- Sauvegarde dans `/public/uploads`
- Retour URL de l'image

#### 7.3 Composant ImageUpload
Créer [`components/backoffice/image-upload.tsx`](components/backoffice/image-upload.tsx):
- Zone drag & drop
- Preview de l'image
- Bouton supprimer
- Loading state
- Gestion erreurs

#### 7.4 Composant AnswerBuilder
Créer [`components/backoffice/answer-builder.tsx`](components/backoffice/answer-builder.tsx):
- Liste dynamique de réponses
- Bouton "Ajouter réponse" (max 6)
- Pour chaque réponse:
  - ID auto (A, B, C, D, E, F)
  - Select type (text/image/text-image)
  - Champs conditionnels selon type
  - Checkbox "Réponse correcte"
  - Bouton supprimer
- Validation:
  - Min 2 réponses
  - Max 6 réponses
  - Min 1 correcte
  - Min 1 incorrecte

#### 7.5 Formulaire Question
Créer [`components/backoffice/question-form.tsx`](components/backoffice/question-form.tsx):
- Section 1: Informations
  - Textarea titre
  - ImageUpload illustration (optionnel)
- Section 2: Réponses
  - AnswerBuilder
- Section 3: Catégories
  - Multi-select avec recherche
  - Affichage avec icônes
  - Groupées par type
- Validation complète
- Loading states

#### 7.6 API Routes Questions

**[`app/api/questions/route.ts`](app/api/questions/route.ts)**
- GET: Liste avec filtres (catégorie, recherche)
- Pagination
- Populate catégories
- POST: Créer question
- Validation complète
- Sauvegarde historique (version 1)

**[`app/api/questions/[id]/route.ts`](app/api/questions/[id]/route.ts)**
- GET: Détails avec populate
- PUT: Modifier
- Incrémenter version
- Sauvegarde historique
- DELETE: Supprimer
- Marquer dans historique

#### 7.7 Pages Questions

**[`app/(backoffice)/questions/page.tsx`](app/(backoffice)/questions/page.tsx)**
- Table/Cards responsive
- Colonnes:
  - Titre (tronqué)
  - Catégories (badges)
  - Nb réponses
  - Date
  - Actions
- Filtres:
  - Par catégorie
  - Par type de catégorie
  - Recherche texte
- Pagination
- Bouton "Nouvelle question"

**[`app/(backoffice)/questions/new/page.tsx`](app/(backoffice)/questions/new/page.tsx)**
- QuestionForm en mode création

**[`app/(backoffice)/questions/[id]/page.tsx`](app/(backoffice)/questions/[id]/page.tsx)**
- QuestionForm en mode édition
- Bouton "Voir historique"

### Livrables
- ✅ Upload et optimisation d'images
- ✅ Constructeur de réponses dynamique
- ✅ CRUD complet des questions
- ✅ Validation robuste
- ✅ Interface complexe mais intuitive

---

## 📋 Phase 8: Système d'historique des modifications

### Objectifs
- Sauvegarder automatiquement les versions
- Créer l'interface de visualisation
- Implémenter la restauration
- Afficher les différences

### Tâches détaillées

#### 8.1 Logique de sauvegarde
Modifier les API routes questions:
- À chaque création: sauvegarder version 1
- À chaque modification: sauvegarder nouvelle version
- À chaque suppression: marquer dans historique
- Stocker snapshot complet de la question

#### 8.2 API Historique

**[`app/api/questions/[id]/history/route.ts`](app/api/questions/[id]/history/route.ts)**
- GET: Liste des versions
- Tri par version décroissante
- Inclure type de changement
- POST: Restaurer une version
- Créer nouvelle version depuis snapshot
- Marquer comme restaurée

#### 8.3 Composant HistoryViewer
Créer [`components/backoffice/history-viewer.tsx`](components/backoffice/history-viewer.tsx):
- Timeline des versions
- Pour chaque version:
  - Numéro version
  - Type de changement (badge)
  - Date et heure
  - Bouton "Voir détails"
  - Bouton "Restaurer"
- Dialog de confirmation restauration
- Indication version actuelle

#### 8.4 Page Historique
Créer [`app/(backoffice)/questions/[id]/history/page.tsx`](app/(backoffice)/questions/[id]/history/page.tsx):
- Titre avec nom de la question
- HistoryViewer
- Bouton retour vers question
- Loading states

#### 8.5 Comparaison visuelle (optionnel)
- Afficher différences entre versions
- Highlight des changements
- Avant/Après

### Livrables
- ✅ Sauvegarde automatique des versions
- ✅ Interface de visualisation
- ✅ Restauration fonctionnelle
- ✅ Traçabilité complète

---

## 📋 Phase 9: Dashboard avec statistiques

### Objectifs
- Créer l'API de statistiques
- Implémenter les graphiques
- Afficher les métriques clés
- Préparer pour futures sessions

### Tâches détaillées

#### 9.1 API Statistiques
Créer [`app/api/stats/route.ts`](app/api/stats/route.ts):
- GET: Retourner toutes les stats
- Métriques:
  - Nombre total questions
  - Nombre par catégorie
  - Nombre par type de catégorie
  - Questions récentes (5 dernières)
  - Répartition types de réponses
  - Stats sessions (si disponibles)

#### 9.2 Dashboard complet
Améliorer [`app/(backoffice)/dashboard/page.tsx`](app/(backoffice)/dashboard/page.tsx):
- Section 1: Métriques principales
  - Cards avec chiffres clés
  - Icônes et couleurs
- Section 2: Graphiques
  - Répartition par catégorie (pie chart)
  - Répartition par type (bar chart)
  - Évolution création questions (line chart)
- Section 3: Questions récentes
  - Liste des 5 dernières
  - Liens vers édition
- Section 4: Actions rapides
  - Boutons vers création
- Skeletons pour chaque section

#### 9.3 Graphiques avec Recharts
- Configurer Recharts
- Créer composants graphiques réutilisables
- Thème dark mode
- Responsive
- Tooltips informatifs

#### 9.4 Préparation sessions
- Modèle Session déjà créé
- API routes à créer plus tard
- Placeholder dans dashboard

### Livrables
- ✅ Dashboard complet avec stats
- ✅ Graphiques interactifs
- ✅ Métriques en temps réel
- ✅ Interface informative

---

## 📋 Phase 10: Optimisation et responsive design

### Objectifs
- Finaliser le responsive sur tous devices
- Optimiser les performances
- Ajouter tous les skeletons manquants
- Polish final de l'UX

### Tâches détaillées

#### 10.1 Responsive complet
- Tester sur mobile (< 768px)
- Tester sur tablet (768-1024px)
- Tester sur desktop (> 1024px)
- Ajuster tous les composants
- Sidebar drawer sur mobile
- Tables en cards sur mobile
- Formulaires adaptés

#### 10.2 Skeletons de chargement
- Ajouter skeletons partout:
  - Listes (tables/cards)
  - Formulaires
  - Dashboard
  - Détails
- États de chargement cohérents
- Transitions fluides

#### 10.3 Optimisations performance
- Lazy loading des images
- Code splitting
- Prefetching navigation
- Optimisation requêtes DB
- Indexes MongoDB
- Pagination efficace

#### 10.4 Gestion d'erreurs
- Error boundaries
- Messages d'erreur clairs
- Fallbacks appropriés
- Retry mechanisms
- Toast notifications

#### 10.5 Accessibilité
- Labels sur tous les champs
- Focus visible
- Navigation clavier
- ARIA labels
- Contraste suffisant

#### 10.6 Polish UX
- Animations subtiles
- Transitions fluides
- Feedback utilisateur
- États hover/active
- Loading states
- Empty states

#### 10.7 Tests manuels
- Tester tous les flows
- Vérifier validations
- Tester edge cases
- Vérifier responsive
- Tester performance

### Livrables
- ✅ Application fully responsive
- ✅ Skeletons partout
- ✅ Performance optimisée
- ✅ UX polie
- ✅ Gestion d'erreurs robuste

---

## 🎯 Checklist finale

### Fonctionnalités
- [ ] Authentification par mot de passe
- [ ] CRUD Types de catégories
- [ ] CRUD Catégories avec icônes
- [ ] CRUD Questions avec images
- [ ] Upload et optimisation images
- [ ] Historique et restauration
- [ ] Dashboard avec statistiques
- [ ] Navigation complète

### Technique
- [ ] MongoDB connecté
- [ ] Tous les modèles créés
- [ ] API routes fonctionnelles
- [ ] Validation Zod partout
- [ ] Gestion d'erreurs
- [ ] Types TypeScript complets

### UX/UI
- [ ] Dark mode complet
- [ ] Responsive mobile/tablet/desktop
- [ ] Skeletons de chargement
- [ ] Animations fluides
- [ ] Feedback utilisateur
- [ ] Empty states
- [ ] Error states

### Performance
- [ ] Images optimisées
- [ ] Lazy loading
- [ ] Pagination
- [ ] Indexes DB
- [ ] Code splitting

---

## 🚀 Prochaines étapes après validation

1. **Validation du plan** par l'utilisateur
2. **Switch en mode Code** pour l'implémentation
3. **Exécution phase par phase** avec validation à chaque étape
4. **Tests et ajustements** au fur et à mesure
5. **Déploiement** une fois tout validé

---

## 📝 Notes importantes

### Ordre d'implémentation
Les phases doivent être suivies dans l'ordre car chacune dépend des précédentes.

### Flexibilité
Le plan peut être ajusté selon les retours et découvertes pendant l'implémentation.

### Communication
À chaque phase, validation avant de passer à la suivante.

### Documentation
Code commenté et documentation à jour tout au long du projet.

---

**Version**: 1.0  
**Date**: 2025-11-29  
**Prêt pour validation**: ✅