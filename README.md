# 🚂 Revision Ferroviaire - Backoffice

Application Next.js de gestion de questions pour révision d'examen ferroviaire.

## 📋 Fonctionnalités

### ✅ Authentification
- Protection par mot de passe unique
- Session sécurisée avec JWT et cookies httpOnly
- Redirection automatique

### ✅ Gestion des Types de Catégories
- CRUD complet (Create, Read, Update, Delete)
- Types par défaut : Lignes, Engin Moteur, Anomalies, Autres
- Validation des dépendances avant suppression

### ✅ Gestion des Catégories
- CRUD complet avec sélecteur d'icônes Lucide
- 90+ icônes disponibles avec recherche
- Liaison aux types de catégories
- Preview en temps réel

### ✅ Gestion des Questions
- CRUD complet avec formulaire en 3 sections
- Upload et optimisation d'images (WebP, max 20KB)
- Constructeur de réponses dynamique (2-6 réponses A-F)
- 3 types de réponses : texte, image, texte+image
- Multi-sélection de catégories
- Validation complète

### ✅ Historique des Modifications
- Sauvegarde automatique de chaque version
- Timeline des modifications
- Restauration de versions antérieures
- Traçabilité complète

### ✅ Dashboard avec Statistiques
- Métriques en temps réel
- Graphiques interactifs (Recharts)
- Questions récentes
- Actions rapides

## 🚀 Installation

### Prérequis
- Node.js 18+
- pnpm (ou npm/yarn)
- Compte MongoDB Atlas

### Étapes

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd rev-train-essai
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer les variables d'environnement**

Copier `.env.example` vers `.env.local` et remplir les valeurs :

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rev-train-essai?retryWrites=true&w=majority&appName=Cluster0
ADMIN_PASSWORD=DreamTeam@2024
JWT_SECRET=votre-secret-key-min-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Revision Ferroviaire
```

4. **Initialiser la base de données**

Démarrer le serveur :
```bash
pnpm dev
```

Puis initialiser les types de catégories par défaut :
```bash
curl -X POST http://localhost:3000/api/seed
```

Ou via le navigateur : http://localhost:3000/api/seed (POST)

5. **Accéder à l'application**

Ouvrir http://localhost:3000

- **Mot de passe** : `DreamTeam@2024`

## 📁 Structure du projet

```
rev-train-essai/
├── app/
│   ├── (auth)/              # Pages d'authentification
│   │   └── login/
│   ├── (backoffice)/        # Pages du backoffice
│   │   ├── dashboard/
│   │   ├── questions/
│   │   ├── categories/
│   │   └── category-types/
│   └── api/                 # API Routes
│       ├── auth/
│       ├── questions/
│       ├── categories/
│       ├── category-types/
│       ├── upload/
│       ├── stats/
│       └── seed/
├── components/
│   ├── ui/                  # Composants Shadcn/ui
│   ├── backoffice/          # Composants métier
│   └── shared/              # Composants partagés
├── lib/
│   ├── models/              # Modèles Mongoose
│   ├── validations/         # Schémas Zod
│   ├── mongodb.ts           # Connexion DB
│   ├── auth.ts              # Authentification
│   ├── image-optimizer.ts   # Optimisation images
│   └── seed.ts              # Seed data
├── types/                   # Types TypeScript
├── docs/                    # Documentation
└── public/uploads/          # Images uploadées
```

## 🎯 Utilisation

### 1. Créer des Types de Catégories

Naviguez vers **Types de catégories** et créez vos types (ex: Lignes, Engin Moteur).

Les 4 types par défaut sont déjà créés via le seed.

### 2. Créer des Catégories

Naviguez vers **Catégories** et créez vos catégories :
- Choisissez un nom
- Sélectionnez une icône
- Associez à un type

### 3. Créer des Questions

Naviguez vers **Questions** et créez vos questions :

**Section 1 : Informations**
- Titre de la question (10-500 caractères)
- Image d'illustration (optionnel)

**Section 2 : Réponses**
- Ajoutez 2 à 6 réponses (A-F)
- Choisissez le type : texte, image, ou texte+image
- Cochez les réponses correctes
- Au moins 1 correcte et 1 incorrecte requises

**Section 3 : Catégories**
- Sélectionnez au moins une catégorie
- Catégories groupées par type

### 4. Gérer l'Historique

Pour chaque question :
- Cliquez sur l'icône **Historique** dans la liste
- Visualisez toutes les versions
- Restaurez une version antérieure si besoin

### 5. Consulter les Statistiques

Le **Dashboard** affiche :
- Nombre de questions, catégories, types
- Graphiques de répartition
- Évolution temporelle
- Questions récentes
- Actions rapides

## 🎨 Design

- **Dark mode** par défaut
- **Responsive** : Mobile, Tablet, Desktop
- **Skeletons** de chargement partout
- **Animations** fluides
- **Notifications** toast pour tous les événements

## 🔒 Sécurité

- Authentification par JWT
- Cookies httpOnly
- Validation Zod côté client et serveur
- Protection des routes via middleware
- Vérification des dépendances avant suppression

## 📸 Upload d'Images

### Développement
- Images stockées dans `/public/uploads`
- Optimisation automatique :
  - Format WebP
  - Resize max 1200x800px
  - Compression jusqu'à 20KB max
  - Qualité ajustée automatiquement

### Production (Vercel)
⚠️ **Important** : L'upload d'images est désactivé en production car Vercel utilise un filesystem read-only.

**Solutions** :
- Utiliser un service externe (Cloudinary, AWS S3)
- Ou commiter les images dans le repo Git

## 🛠️ Scripts disponibles

```bash
# Développement
pnpm dev

# Build production
pnpm build

# Démarrer en production
pnpm start

# Linter
pnpm lint

# Initialiser la base de données
curl -X POST http://localhost:3000/api/seed
```

## 📊 Base de données MongoDB

### Collections

- **categoryTypes** : Types de catégories
- **categories** : Catégories avec icônes
- **questions** : Questions avec réponses
- **questionhistories** : Historique des modifications
- **sessions** : Sessions de quiz (futur)

### Indexes

Indexes créés automatiquement pour optimiser les performances :
- Recherche par nom
- Filtrage par catégorie/type
- Tri par date
- Recherche full-text sur les questions

## 🔧 Technologies utilisées

- **Frontend** : Next.js 16, React 19, TypeScript
- **UI** : Shadcn/ui, Tailwind CSS 4
- **Backend** : Next.js API Routes
- **Database** : MongoDB Atlas, Mongoose
- **Images** : Sharp (optimisation)
- **Forms** : React Hook Form, Zod
- **Charts** : Recharts
- **Icons** : Lucide React
- **Dates** : date-fns

## 📝 Notes importantes

### Limitations connues

- Upload d'images désactivé en production Vercel
- Mot de passe unique (pas de multi-utilisateurs)
- Pas d'interface publique de quiz (backoffice uniquement)

### Évolutions futures possibles

- Migration images vers Cloudinary
- Multi-utilisateurs avec rôles
- Interface publique de quiz
- Export/Import questions (JSON)
- Mode hors-ligne (PWA)
- Analytics avancées

## 🐛 Dépannage

### Erreur de connexion MongoDB

Vérifiez que :
- L'URI MongoDB est correcte dans `.env.local`
- Votre IP est autorisée dans MongoDB Atlas
- Le nom de la base de données est correct

### Images ne s'affichent pas

Vérifiez que :
- Le dossier `/public/uploads` existe
- Les permissions sont correctes
- L'image a bien été uploadée

### Erreur d'authentification

Vérifiez que :
- Le mot de passe dans `.env.local` est correct
- Le JWT_SECRET est défini
- Les cookies sont activés dans le navigateur

## 📖 Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - Architecture technique complète
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) - Plan d'implémentation détaillé
- [`docs/TECHNICAL_DECISIONS.md`](docs/TECHNICAL_DECISIONS.md) - Décisions techniques

## 👨‍💻 Développement

### Ajouter un nouveau composant Shadcn/ui

```bash
npx shadcn@latest add <component-name>
```

### Structure des API Routes

Toutes les API routes suivent le pattern :
```typescript
{
  success: boolean,
  data?: any,
  error?: string,
  message?: string
}
```

### Conventions de code

- TypeScript strict mode
- Composants Server par défaut
- 'use client' uniquement si nécessaire
- Validation Zod partout
- Gestion d'erreurs avec try/catch

## 📄 Licence

Usage personnel uniquement.

---

**Version** : 1.0.0  
**Date** : 2025-11-29  
**Auteur** : Kilo Code
