# Plan d'Implémentation V2 - Interface Publique de Quiz

## 📋 Vue d'ensemble

Développement de l'interface publique permettant aux utilisateurs de s'entraîner avec deux modes de jeu :
1. **Mode Quiz** : Session avec nombre de questions défini
2. **Mode Révision** : Répétition espacée jusqu'à validation complète

## 🎯 Objectifs de la V2

- ✅ Interface publique accessible sans authentification
- ✅ Deux modes de jeu distincts avec leurs spécificités
- ✅ Système de sélection/bannissement de catégories
- ✅ Sauvegarde des scores et statistiques
- ✅ Gestion du pseudonyme via localStorage
- ✅ Animations fluides entre questions
- ✅ Design cohérent avec le backoffice (dark mode, Shadcn/ui)

---

## 📊 Nouveaux Modèles de Données

### Collection: `quizSessions`

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
    selectedCategories: ObjectId[],  // Vide = toutes
    bannedCategories: ObjectId[]
  },
  results: [
    {
      questionId: ObjectId,
      questionTitle: string,
      userAnswers: string[],          // IDs des réponses sélectionnées
      correctAnswers: string[],
      isCorrect: boolean,
      categories: ObjectId[]
    }
  ],
  duration: number,                   // En secondes
  completedAt: Date,
  createdAt: Date
}
```

### Collection: `revisionSessions`

```typescript
{
  _id: ObjectId,
  pseudonym: string,
  mode: "revision",
  settings: {
    selectedCategories: ObjectId[]    // Vide = toutes
  },
  stats: {
    totalAnswers: number,
    correctAnswers: number,
    incorrectAnswers: number,
    questionsValidated: number        // Questions avec 2+ bonnes réponses
  },
  duration: number,                   // En secondes
  completedAt: Date,
  createdAt: Date
}
```

---

## 🏗️ Structure des Nouvelles Routes

```
app/
├── (public)/                        # Nouveau groupe de routes
│   ├── layout.tsx                   # Layout public (sans sidebar)
│   ├── page.tsx                     # Page d'accueil publique
│   ├── quiz/
│   │   ├── setup/
│   │   │   └── page.tsx            # Configuration du quiz
│   │   ├── play/
│   │   │   └── page.tsx            # Session de quiz en cours
│   │   └── results/
│   │       └── page.tsx            # Résultats du quiz
│   └── revision/
│       ├── setup/
│       │   └── page.tsx            # Configuration révision
│       ├── play/
│       │   └── page.tsx            # Session révision en cours
│       └── results/
│           └── page.tsx            # Résultats révision
└── api/
    ├── quiz/
    │   ├── generate/
    │   │   └── route.ts            # POST: Générer quiz
    │   └── sessions/
    │       └── route.ts            # POST: Sauvegarder session
    ├── revision/
    │   ├── generate/
    │   │   └── route.ts            # POST: Générer questions révision
    │   └── sessions/
    │       └── route.ts            # POST: Sauvegarder session
    └── public/
        ├── stats/
        │   └── route.ts            # GET: Stats publiques
        └── categories/
            └── route.ts            # GET: Liste catégories publiques
```

---

## 🎨 Nouveaux Composants

### Composants Publics

```
components/
├── public/
│   ├── public-header.tsx           # Header avec lien backoffice
│   ├── public-footer.tsx           # Footer simple
│   ├── mode-selector.tsx           # Sélection mode (accueil)
│   ├── pseudonym-manager.tsx       # Gestion pseudonyme localStorage
│   ├── category-selector.tsx       # Sélecteur 3 états
│   ├── question-display.tsx        # Affichage question
│   ├── answer-selector.tsx         # Sélection réponses
│   ├── quiz-progress.tsx           # Barre progression quiz
│   ├── revision-progress.tsx       # Progression révision
│   ├── timer-display.tsx           # Affichage timer
│   ├── results-summary.tsx         # Résumé résultats
│   ├── results-details.tsx         # Détails questions (accordéon)
│   ├── save-score-dialog.tsx       # Dialog sauvegarde score
│   └── exit-confirmation.tsx       # Confirmation sortie session
└── ui/
    └── accordion.tsx               # Nouveau composant Shadcn
```

---

## 📝 Plan d'Implémentation Détaillé

### Phase 1 : Infrastructure et Modèles (2-3h)

#### 1.1 Modèles MongoDB
- [ ] Créer [`lib/models/quiz-session.ts`](lib/models/quiz-session.ts)
- [ ] Créer [`lib/models/revision-session.ts`](lib/models/revision-session.ts)
- [ ] Ajouter indexes pour performances

#### 1.2 Validations Zod
- [ ] Créer [`lib/validations/quiz.ts`](lib/validations/quiz.ts)
  - Schema configuration quiz
  - Schema sauvegarde session
- [ ] Créer [`lib/validations/revision.ts`](lib/validations/revision.ts)
  - Schema configuration révision
  - Schema sauvegarde session

#### 1.3 Types TypeScript
- [ ] Créer [`types/quiz.ts`](types/quiz.ts)
- [ ] Créer [`types/revision.ts`](types/revision.ts)
- [ ] Créer [`types/session.ts`](types/session.ts)

---

### Phase 2 : API Routes (3-4h)

#### 2.1 API Quiz
- [ ] [`app/api/quiz/generate/route.ts`](app/api/quiz/generate/route.ts)
  - POST: Générer quiz selon paramètres
  - Logique sélection/bannissement catégories
  - Sélection aléatoire questions
  - Validation nombre questions disponibles

- [ ] [`app/api/quiz/sessions/route.ts`](app/api/quiz/sessions/route.ts)
  - POST: Sauvegarder session complète
  - Calcul score
  - Validation données

#### 2.2 API Révision
- [ ] [`app/api/revision/generate/route.ts`](app/api/revision/generate/route.ts)
  - POST: Récupérer questions selon catégories
  - Ordre aléatoire initial

- [ ] [`app/api/revision/sessions/route.ts`](app/api/revision/sessions/route.ts)
  - POST: Sauvegarder session révision
  - Calcul statistiques

#### 2.3 API Publique
- [ ] [`app/api/public/stats/route.ts`](app/api/public/stats/route.ts)
  - GET: Nombre total questions
  - Répartition par catégorie

- [ ] [`app/api/public/categories/route.ts`](app/api/public/categories/route.ts)
  - GET: Liste catégories avec icônes
  - Groupées par type

---

### Phase 3 : Layout et Navigation Publique (2h)

#### 3.1 Layout Public
- [ ] Créer [`app/(public)/layout.tsx`](app/(public)/layout.tsx)
  - Header simple avec logo
  - Lien discret "Administration"
  - Footer
  - Pas de sidebar

#### 3.2 Composants Navigation
- [ ] Créer [`components/public/public-header.tsx`](components/public/public-header.tsx)
  - Logo/Titre
  - Lien backoffice (icône Settings)
  - Dark mode

- [ ] Créer [`components/public/public-footer.tsx`](components/public/public-footer.tsx)
  - Copyright
  - Version

---

### Phase 4 : Page d'Accueil Publique (2-3h)

#### 4.1 Page Principale
- [ ] Créer [`app/(public)/page.tsx`](app/(public)/page.tsx)
  - Hero section avec titre
  - Gestion pseudonyme
  - Sélection mode (2 cards)
  - Stats globales

#### 4.2 Composants Accueil
- [ ] Créer [`components/public/pseudonym-manager.tsx`](components/public/pseudonym-manager.tsx)
  - Affichage "Bienvenue, [pseudo]"
  - Bouton "Ce n'est pas moi"
  - Dialog modification pseudonyme
  - Gestion localStorage

- [ ] Créer [`components/public/mode-selector.tsx`](components/public/mode-selector.tsx)
  - Card Mode Quiz
  - Card Mode Révision
  - Descriptions
  - Boutons CTA

---

### Phase 5 : Sélecteur de Catégories (2-3h)

#### 5.1 Composant Principal
- [ ] Créer [`components/public/category-selector.tsx`](components/public/category-selector.tsx)
  - Affichage toutes catégories
  - 3 états : Non sélectionnée → Sélectionnée → Bannie
  - Gestion clics cycliques
  - Groupement par type
  - Compteurs par état

#### 5.2 États Visuels
- **Non sélectionnée** (défaut)
  - Badge variant: `secondary`
  - Opacité: 50%
  - Icône: Circle (Lucide)
  - Couleur: gris

- **Sélectionnée**
  - Badge variant: `default` (primary)
  - Opacité: 100%
  - Icône: CheckCircle2 (Lucide)
  - Couleur: bleu accent

- **Bannie**
  - Badge variant: `destructive`
  - Opacité: 100%
  - Icône: XCircle (Lucide)
  - Couleur: rouge

---

### Phase 6 : Configuration Quiz (2-3h)

#### 6.1 Page Setup
- [ ] Créer [`app/(public)/quiz/setup/page.tsx`](app/(public)/quiz/setup/page.tsx)
  - Formulaire configuration
  - Input nombre questions (1 à max)
  - Sélecteur catégories
  - Validation disponibilité
  - Bouton "Démarrer"

#### 6.2 Logique Configuration
- [ ] Validation nombre questions selon filtres
- [ ] Affichage nombre questions disponibles
- [ ] Gestion état formulaire
- [ ] Navigation vers `/quiz/play`

---

### Phase 7 : Session Quiz (4-5h)

#### 7.1 Page Play
- [ ] Créer [`app/(public)/quiz/play/page.tsx`](app/(public)/quiz/play/page.tsx)
  - Gestion état session
  - Timer automatique
  - Navigation questions
  - Sauvegarde réponses
  - Confirmation sortie

#### 7.2 Composants Quiz
- [ ] Créer [`components/public/question-display.tsx`](components/public/question-display.tsx)
  - Affichage titre
  - Image illustration (si présente)
  - Indication "Plusieurs réponses possibles"
  - Numéro question

- [ ] Créer [`components/public/answer-selector.tsx`](components/public/answer-selector.tsx)
  - Affichage réponses (A-F)
  - Support 3 types (texte, image, mixte)
  - Sélection multiple
  - Validation réponse
  - Feedback visuel (correct/incorrect)
  - Bouton "Valider" puis "Continuer"

- [ ] Créer [`components/public/quiz-progress.tsx`](components/public/quiz-progress.tsx)
  - Barre progression
  - Compteur questions (3/20)
  - Timer

- [ ] Créer [`components/public/timer-display.tsx`](components/public/timer-display.tsx)
  - Format MM:SS
  - Démarrage auto
  - Arrêt à dernière réponse

- [ ] Créer [`components/public/exit-confirmation.tsx`](components/public/exit-confirmation.tsx)
  - Dialog confirmation
  - Avertissement perte score

#### 7.3 Animations
- [ ] Transition slide entre questions
- [ ] Feedback réponse (shake si faux, bounce si correct)
- [ ] Smooth scroll

---

### Phase 8 : Résultats Quiz (3-4h)

#### 8.1 Page Results
- [ ] Créer [`app/(public)/quiz/results/page.tsx`](app/(public)/quiz/results/page.tsx)
  - Récupération données session
  - Affichage résumé
  - Détails questions
  - Actions (sauvegarder, rejouer, accueil)

#### 8.2 Composants Résultats
- [ ] Créer [`components/public/results-summary.tsx`](components/public/results-summary.tsx)
  - Score global (X/Y)
  - Pourcentage
  - Temps total
  - Graphique circulaire (Recharts)
  - Statistiques par catégorie

- [ ] Créer [`components/public/results-details.tsx`](components/public/results-details.tsx)
  - Accordéon questions
  - Priorité questions fausses
  - Affichage réponse utilisateur
  - Affichage réponse correcte
  - Explication visuelle

- [ ] Créer [`components/public/save-score-dialog.tsx`](components/public/save-score-dialog.tsx)
  - Input pseudonyme (pré-rempli si localStorage)
  - Sauvegarde localStorage
  - Appel API sauvegarde
  - Feedback succès

#### 8.3 Actions Post-Quiz
- [ ] Bouton "Sauvegarder mon score"
- [ ] Bouton "Rejouer avec les mêmes paramètres"
- [ ] Bouton "Nouveau quiz"
- [ ] Bouton "Retour à l'accueil"

---

### Phase 9 : Configuration Révision (2h)

#### 9.1 Page Setup
- [ ] Créer [`app/(public)/revision/setup/page.tsx`](app/(public)/revision/setup/page.tsx)
  - Sélecteur catégories (même composant)
  - Affichage nombre questions
  - Explication mode révision
  - Bouton "Commencer"

---

### Phase 10 : Session Révision (5-6h)

#### 10.1 Page Play
- [ ] Créer [`app/(public)/revision/play/page.tsx`](app/(public)/revision/play/page.tsx)
  - Gestion état complexe (compteurs par question)
  - Timer automatique
  - Logique répétition espacée
  - Algorithme validation (2x correct)
  - Réinitialisation compteur si faux

#### 10.2 Logique Révision
```typescript
// État par question
{
  questionId: string,
  correctCount: 0,      // 0, 1, ou 2+
  lastAnswer: null,     // "correct" | "incorrect"
  isValidated: false    // true si correctCount >= 2
}

// Logique
- Si réponse correcte: correctCount++
- Si réponse incorrecte: correctCount = 0
- Si correctCount >= 2: isValidated = true
- Pool questions = questions non validées
- Ordre aléatoire à chaque tour
- Fin si toutes validées
```

#### 10.3 Composants Révision
- [ ] Créer [`components/public/revision-progress.tsx`](components/public/revision-progress.tsx)
  - Barre progression (questions validées)
  - Compteur "15/50 validées"
  - Détail par question (0/2, 1/2, 2/2)
  - Timer
  - Stats temps réel (bonnes/mauvaises)

#### 10.4 Affichage Question
- [ ] Réutiliser [`question-display.tsx`](components/public/question-display.tsx)
- [ ] Réutiliser [`answer-selector.tsx`](components/public/answer-selector.tsx)
- [ ] Feedback immédiat après validation
- [ ] Indication progression question (0/2, 1/2)

---

### Phase 11 : Résultats Révision (2-3h)

#### 11.1 Page Results
- [ ] Créer [`app/(public)/revision/results/page.tsx`](app/(public)/revision/results/page.tsx)
  - Affichage temps total
  - Statistiques globales
  - Répartition bonnes/mauvaises
  - Actions

#### 11.2 Composants Résultats
- [ ] Adapter [`results-summary.tsx`](components/public/results-summary.tsx)
  - Temps total
  - Nombre total réponses
  - Taux de réussite
  - Graphiques

- [ ] Adapter [`save-score-dialog.tsx`](components/public/save-score-dialog.tsx)
  - Sauvegarde session révision
  - Pas de détails questions

#### 11.3 Actions Post-Révision
- [ ] Bouton "Sauvegarder mon temps"
- [ ] Bouton "Recommencer"
- [ ] Bouton "Retour à l'accueil"

---

### Phase 12 : Utilitaires et Helpers (2h)

#### 12.1 Helpers Quiz
- [ ] Créer [`lib/quiz-helpers.ts`](lib/quiz-helpers.ts)
  - `generateQuiz()`: Sélection questions
  - `calculateScore()`: Calcul score
  - `validateAnswers()`: Vérification réponses
  - `filterByCategories()`: Filtrage catégories

#### 12.2 Helpers Révision
- [ ] Créer [`lib/revision-helpers.ts`](lib/revision-helpers.ts)
  - `initializeRevision()`: Init état questions
  - `updateQuestionState()`: MAJ compteurs
  - `getNextQuestion()`: Sélection prochaine
  - `isRevisionComplete()`: Vérification fin

#### 12.3 LocalStorage
- [ ] Créer [`lib/local-storage.ts`](lib/local-storage.ts)
  - `getPseudonym()`: Récupération
  - `setPseudonym()`: Sauvegarde
  - `clearPseudonym()`: Suppression
  - `getQuizSettings()`: Derniers paramètres
  - `setQuizSettings()`: Sauvegarde paramètres

---

### Phase 13 : Responsive et Animations (2-3h)

#### 13.1 Responsive
- [ ] Mobile (< 768px)
  - Questions full-width
  - Réponses empilées
  - Progress bar simplifiée
  - Boutons full-width

- [ ] Tablet (768px - 1024px)
  - Layout optimisé
  - Réponses 2 colonnes si possible

- [ ] Desktop (> 1024px)
  - Layout centré max-width
  - Réponses en grille

#### 13.2 Animations
- [ ] Installer Framer Motion (si nécessaire)
- [ ] Transition slide entre questions
  ```typescript
  // Slide horizontal
  initial={{ x: 100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: -100, opacity: 0 }}
  ```
- [ ] Feedback réponse
  - Correct: bounce + vert
  - Incorrect: shake + rouge
- [ ] Progress bar animée
- [ ] Compteurs animés (count-up)

---

### Phase 14 : Composants Shadcn Additionnels (1h)

#### 14.1 Installation
```bash
npx shadcn@latest add accordion
npx shadcn@latest add progress
npx shadcn@latest add avatar
```

#### 14.2 Configuration
- [ ] Configurer variants accordion
- [ ] Configurer progress bar
- [ ] Tester composants

---

### Phase 15 : Tests et Optimisations (2-3h)

#### 15.1 Tests Fonctionnels
- [ ] Test mode quiz complet
  - Configuration
  - Session
  - Résultats
  - Sauvegarde

- [ ] Test mode révision complet
  - Configuration
  - Logique répétition
  - Validation questions
  - Résultats

- [ ] Test sélecteur catégories
  - 3 états
  - Combinaisons
  - Edge cases

- [ ] Test localStorage
  - Sauvegarde pseudonyme
  - Récupération
  - Suppression

#### 15.2 Tests Responsive
- [ ] Mobile (iPhone, Android)
- [ ] Tablet (iPad)
- [ ] Desktop (différentes résolutions)

#### 15.3 Optimisations
- [ ] Lazy loading images
- [ ] Optimisation re-renders
- [ ] Memoization composants lourds
- [ ] Prefetch données

---

### Phase 16 : Documentation et Finalisation (1-2h)

#### 16.1 Documentation
- [ ] Mettre à jour [`CHANGELOG.md`](CHANGELOG.md)
  - Version 2.0.0
  - Nouvelles fonctionnalités
  - Statistiques

- [ ] Mettre à jour [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
  - Nouveaux modèles
  - Nouvelles routes
  - Nouveaux composants

- [ ] Mettre à jour [`docs/TECHNICAL_DECISIONS.md`](docs/TECHNICAL_DECISIONS.md)
  - Choix animations
  - Choix localStorage
  - Logique révision

#### 16.2 README
- [ ] Ajouter section "Modes de jeu"
- [ ] Ajouter captures d'écran
- [ ] Mettre à jour instructions

---

## 🎨 Design System - Spécifications

### Couleurs États Catégories

```typescript
// Non sélectionnée
className="bg-secondary/50 text-secondary-foreground/70 hover:bg-secondary/70"
icon={<Circle className="h-3 w-3" />}

// Sélectionnée
className="bg-primary text-primary-foreground hover:bg-primary/90"
icon={<CheckCircle2 className="h-3 w-3" />}

// Bannie
className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
icon={<XCircle className="h-3 w-3" />}
```

### Animations

```typescript
// Transition questions
const slideVariants = {
  enter: { x: 100, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 }
};

// Feedback réponse correcte
const bounceVariants = {
  scale: [1, 1.1, 1],
  transition: { duration: 0.3 }
};

// Feedback réponse incorrecte
const shakeVariants = {
  x: [0, -10, 10, -10, 10, 0],
  transition: { duration: 0.5 }
};
```

---

## 📦 Dépendances Additionnelles

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",  // Animations (optionnel)
    "use-local-storage-state": "^19.0.0"  // Helper localStorage (optionnel)
  }
}
```

---

## 🔒 Sécurité et Validation

### Validation Côté Client
- [ ] Zod schemas pour tous les formulaires
- [ ] Validation nombre questions
- [ ] Validation sélection catégories
- [ ] Sanitization pseudonyme

### Validation Côté Serveur
- [ ] Vérification existence questions
- [ ] Validation IDs MongoDB
- [ ] Rate limiting (futur)
- [ ] Validation données session

---

## 📊 Métriques de Succès

### Fonctionnelles
- ✅ Mode quiz fonctionnel de bout en bout
- ✅ Mode révision avec logique répétition
- ✅ Sélecteur catégories 3 états
- ✅ Sauvegarde scores/temps
- ✅ Gestion pseudonyme localStorage
- ✅ Animations fluides

### Techniques
- ✅ Responsive mobile/tablet/desktop
- ✅ Performance (< 3s chargement)
- ✅ Pas de bugs critiques
- ✅ Code TypeScript strict
- ✅ Validation complète

### UX
- ✅ Interface intuitive
- ✅ Feedback immédiat
- ✅ Transitions smooth
- ✅ États de chargement
- ✅ Messages d'erreur clairs

---

## 🚀 Ordre d'Exécution Recommandé

1. **Jour 1** : Phases 1-3 (Infrastructure, API, Layout)
2. **Jour 2** : Phases 4-6 (Accueil, Catégories, Config Quiz)
3. **Jour 3** : Phases 7-8 (Session Quiz, Résultats)
4. **Jour 4** : Phases 9-11 (Révision complète)
5. **Jour 5** : Phases 12-16 (Helpers, Polish, Documentation)

**Estimation totale** : 35-45 heures de développement

---

## 📝 Notes Importantes

### Limitations Connues
- Pas de système de pause (timer continu)
- Pas d'historique personnel visible (juste sauvegarde)
- Pas de leaderboard public
- Pas de mode hors-ligne

### Évolutions Futures Possibles
- [ ] Leaderboard public
- [ ] Historique personnel avec graphiques
- [ ] Mode challenge (contre la montre)
- [ ] Partage résultats (social)
- [ ] PWA avec mode hors-ligne
- [ ] Statistiques avancées par catégorie

---

## ✅ Checklist Validation Avant Développement

- [ ] Plan validé par le client
- [ ] Modèles de données approuvés
- [ ] Design system défini
- [ ] Composants Shadcn identifiés
- [ ] Structure routes validée
- [ ] Logique révision claire
- [ ] Animations spécifiées

---

**Version** : 2.0  
**Date** : 2025-11-29  
**Auteur** : Kilo Code (Code Mode)  
**Statut** : En attente de validation client