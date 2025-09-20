# Règles de Développement - École Management Frontend

## 🎯 **PHILOSOPHIE : "FEATURE-FIRST & SIMPLICITÉ"**

### **Principe fondamental**
- Une feature = un dossier complet et autonome
- Développement rapide et itératif
- Simple d'abord, complexification si nécessaire
- Feedback utilisateur constant

---

## 🏗️ **ARCHITECTURE & STACK TECHNIQUE**

### **Stack obligatoire**
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** uniquement (0% CSS custom)
- **React Query** pour les données serveur
- **React Hook Form** + **Zod** pour les formulaires
- **Axios** pour les appels API

### **Structure des dossiers**
```
src/
├── features/           # Organisation par fonctionnalité métier
│   ├── auth/          # Authentification
│   │   ├── api.ts     # API calls + hooks React Query
│   │   ├── types.ts   # Types spécifiques à l'auth
│   │   └── components/ # Composants auth (LoginForm, etc.)
│   ├── students/      # Gestion des élèves
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── components/
│   └── classes/       # Gestion des classes
├── shared/            # Code partagé entre features
│   ├── components/    # UI générique (Button, Modal, etc.)
│   ├── hooks/         # Hooks utilitaires
│   ├── utils/         # Fonctions utilitaires
│   └── types/         # Types partagés
├── app/               # Configuration globale
│   ├── router.tsx     # Configuration des routes
│   └── providers.tsx  # Providers globaux
└── pages/             # Pages qui assemblent les features
```

---

## 📋 **WORKFLOW DE DÉVELOPPEMENT**

### **🚀 Développement d'une nouvelle feature (2h max)**

#### **Phase 1 : Investigation Backend (15 min - CRITIQUE)**
⚠️ **RÈGLE D'OR : "NEVER ASSUME, ALWAYS VERIFY"**

1. **🔍 Analyser l'API avec VS Code** :
   - **Ouvrir le domaine backend** : `backend/app/domains/[feature]/`
   - **Examiner directement** :
     - `router.py` → Endpoints et méthodes HTTP
     - `schemas.py` → Structures de données (Create/Read/Update)
     - `models.py` → Modèles de base de données
   - **Navigation rapide** : Ctrl+P pour ouvrir rapidement les fichiers
   - **Recherche globale** : Ctrl+Shift+F pour chercher dans tout le backend

2. **📖 Documentation FastAPI** :
   - **Terminal intégré** : Ctrl+` puis `cd backend && uvicorn app.main:app --reload`
   - **Browser VS Code** : Consulter `http://localhost:8000/docs`
   - **COPIER-COLLER les endpoints exacts, structures JSON, paramètres**
   - **TESTER les endpoints avec l'interface Swagger**

3. **🧪 Validation rapide** :
   ```bash
   # Terminal VS Code intégré - Tests rapides
   curl -X POST "http://localhost:8000/auth/login" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=test&password=test123"
   
   # Vérifier les erreurs
   curl -X POST "http://localhost:8000/auth/login" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=wrong&password=wrong"
   ```

4. **📝 Notes rapides** :
   - **Pas de fichier séparé** - utiliser les commentaires dans le code
   - **Types directs** : Copier-coller depuis `schemas.py` vers `types.ts`
   - **Endpoints listés** : Copier depuis `router.py` vers `api.ts`

#### **Phase 2 : Setup Frontend (15 min)**
1. **Créer la structure** avec la navigation VS Code :
   ```bash
   src/features/nom-feature/
   ├── api.ts       # Endpoints + hooks React Query
   ├── types.ts     # Types TypeScript (copie directe depuis backend/schemas.py)
   └── components/  # Composants de la feature
   ```

2. **Copier les types** : Ouvrir `backend/app/domains/[feature]/schemas.py` et adapter directement
3. **Créer les hooks API** : Copier les endpoints depuis `backend/app/domains/[feature]/router.py`
4. **Validation en temps réel** : VS Code affiche les erreurs TypeScript instantanément

#### **Phase 3 : Développement UI (80 min)**
1. **Composants simples** : Formulaires, listes, détails
2. **Assembly** : Créer la page qui utilise les composants  
3. **Test en temps réel** : Terminal intégré + Hot reload + backend en parallèle
4. **Debug efficace** : VS Code breakpoints + Network tab + Console

#### **Phase 4 : Finalisation (10 min)**
1. **Routing** : Ajouter les routes dans `app/router.tsx`
2. **Validation finale** : Types TypeScript + Tests manuels
3. **Next !** : Passer à la feature suivante

---

## 🎨 **CONVENTIONS DE NOMMAGE**

### **Fichiers et dossiers**
- **Features** : `kebab-case` (ex: `student-management/`)
- **Composants** : `PascalCase` (ex: `StudentForm.tsx`)
- **Hooks** : `camelCase` avec préfixe `use` (ex: `useStudents.ts`)
- **Types** : `PascalCase` avec préfixe `T` (ex: `TStudent`)

### **Variables et fonctions**
- **Variables/fonctions** : `camelCase`
- **Constantes** : `UPPER_SNAKE_CASE`
- **Interfaces** : `PascalCase` avec préfixe `I` (ex: `IApiResponse`)

---

## 🚫 **RÈGLES ANTI-ASSUMPTION**

### **❌ INTERDICTIONS ABSOLUES**
- ❌ **Supposer les noms des endpoints** : `GET /users` → Vérifier que c'est vraiment `/users` et pas `/utilisateurs`
- ❌ **Supposer les formats de données** : email → Vérifier si c'est vraiment email ou username générique
- ❌ **Supposer les codes d'erreur** : 400, 401, 500 → Examiner TOUTES les réponses possibles
- ❌ **Supposer les validations** : "Le backend valide déjà" → Toujours implémenter la validation frontend
- ❌ **Copier d'autres projets** : "Dans mon ancien projet..." → Chaque backend est unique

### **✅ OBLIGATONS DE VÉRIFICATION**

#### **🔍 Checklist Investigation Backend avec VS Code**
Avant de coder QUOI QUE CE SOIT :

- [ ] **Router analysé** : Ouvert `backend/app/domains/[feature]/router.py` dans VS Code
- [ ] **Schema vérifié** : Consulté `backend/app/domains/[feature]/schemas.py` 
- [ ] **Models examinés** : Vérifié `backend/app/domains/[feature]/models.py`
- [ ] **Endpoint testé** : Testé avec le terminal intégré VS Code ou Swagger UI
- [ ] **Erreurs documentées** : Listé toutes les erreurs possibles (400, 401, 422, 500)
- [ ] **Types copiés** : Adapté directement les schemas Pydantic en TypeScript

#### **📝 Workflow optimisé VS Code**
**Plus besoin de fichiers d'analyse intermédiaires !**

1. **Navigation rapide** :
   - `Ctrl+P` → Ouvrir rapidement n'importe quel fichier backend
   - `Ctrl+Shift+P` → Rechercher dans tous les fichiers
   - `F12` → Aller à la définition (si extensions Python installées)

2. **Copie directe des types** :
   ```python
   # backend/app/domains/students/schemas.py
   class StudentCreate(BaseModel):
       nom: str
       prenom: str
       date_naissance: date
   ```
   
   ```typescript
   // src/features/students/types.ts  
   export interface TStudentCreate {
     nom: string;
     prenom: string;
     date_naissance: string;  // ISO date format
   }
   ```

3. **Tests en parallèle** :
   - **Terminal 1** : `npm run dev` (frontend)
   - **Terminal 2** : `cd backend && uvicorn app.main:app --reload`
   - **Onglet browser** : Swagger UI + Frontend
   - **Split screen** : Frontend code + Backend schemas côte à côte

#### **🚦 Règle des 3 Vérifications**
Avant de passer en prod, TOUJOURS :

1. **Backend Code Review** : Re-lire le code backend une dernière fois
2. **Integration Test** : Tester avec le vrai backend démarré  
3. **Error Cases** : Provoquer TOUTES les erreurs possibles

### **🔧 WORKFLOW ANTI-ASSUMPTION avec VS Code**

#### **Étape 1 : EXPLORATION (navigation VS Code)**
```
📁 Backend accessible directement dans l'explorateur VS Code !

backend/app/domains/[FEATURE]/
├── router.py     ← Ctrl+Click pour ouvrir rapidement
├── schemas.py    ← F12 pour aller aux définitions
├── models.py     ← Ctrl+F pour rechercher dans le fichier
└── services.py   ← Split screen avec le frontend
```

#### **Étape 2 : VALIDATION (terminal intégré)**
```bash
# Terminal VS Code intégré (Ctrl+`)
cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Tester CHAQUE endpoint (nouveau terminal)
curl -X GET "http://localhost:8000/[endpoint]"
curl -X POST "http://localhost:8000/[endpoint]" -H "Content-Type: application/json" -d '{}'

# Browser intégré VS Code : Ctrl+Shift+P → "Simple Browser"
# URL: http://localhost:8000/docs
```

#### **Étape 3 : IMPLEMENTATION (développement fluide)**
Développement en **split screen** avec certitude :
- **Gauche** : `backend/app/domains/[feature]/schemas.py`
- **Droite** : `src/features/[feature]/types.ts` 
- **Terminal intégré** : Tests API en temps réel
- **Hot reload** : Changements visibles instantanément

### **🚨 SIGNAUX D'ALARME**
Si tu te dis :
- "Ça devrait être comme ça..."  → 🚨 STOP, VERIFY!
- "Normalement l'API fait..."    → 🚨 STOP, VERIFY!  
- "Dans la plupart des cas..."   → 🚨 STOP, VERIFY!
- "Je suppose que..."            → 🚨 STOP, VERIFY!

### **� EXEMPLES CONCRETS DE VIOLATIONS**

#### **❌ Violation typique - Types supposés**
```typescript
// ❌ Supposer la structure sans vérifier le backend
interface TAnneeScolaire { 
  annee: string;  // WRONG! Backend utilise "nom"
}

// Résultat : currentYear.annee → undefined
<p>Année: {currentYear.annee}</p> // Affiche juste "Année: "
```

#### **✅ Méthode correcte - VS Code Navigation**
```bash
# 1. OBLIGATOIRE : Navigation directe VS Code
# Ctrl+P → "schemas.py" → Sélectionner le bon domaine
# → AnneeScolaireRead a un field "nom", pas "annee"

# 2. Tester l'endpoint (terminal intégré VS Code)
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/planification/annees-scolaires/actuelle
# Response: {"nom": "2024-2025", "date_debut": "2024-10-01", ...}

# 3. Copier-coller direct des types (split screen)
# Gauche: backend/app/domains/planification/schemas.py
# Droite: src/features/classes/types.ts
interface TAnneeScolaire {
  nom: string;          // ✅ COPIÉ depuis le schema Pydantic
  date_debut: string;   // ✅ COPIÉ depuis le schema Pydantic  
  date_fin: string;     // ✅ COPIÉ depuis le schema Pydantic
  is_current?: boolean; // ✅ COPIÉ depuis le schema Pydantic
}

# 4. Utiliser correctement
<p>Année: {currentYear.nom}</p> // ✅ Affiche "Année: 2024-2025"
```

#### **⚠️ Autres violations courantes**
```typescript
// ❌ Supposer les endpoints
const API_URL = '/users';  // Mais backend a '/utilisateurs'

// ❌ Supposer les champs requis  
username: z.string().email()  // Mais backend accepte username générique

// ❌ Supposer les codes d'erreur
if (error.status === 400)  // Mais backend retourne 422 pour validation

// ❌ Supposer les formats de date
date: "2024-01-01"  // Mais backend attend "01/01/2024"
```

#### **✅ Processus de vérification optimisé VS Code**
```bash
# WORKFLOW SIMPLIFIÉ avec backend dans workspace :

# 1. Explorer la structure (navigation VS Code)
# Explorateur VS Code → backend/app/domains → [feature] → schemas.py
# Ou Ctrl+P → "schemas.py" et sélectionner le bon domaine

# 2. Examiner les routers (split screen)  
# Ouvrir côte à côte : router.py + api.ts frontend
# Copier-coller les endpoints directs

# 3. Démarrer et tester (terminal intégré)
# Terminal 1: npm run dev
# Terminal 2: cd backend && uvicorn app.main:app --reload
# Browser VS Code: Ctrl+Shift+P → Simple Browser → http://localhost:8000/docs

# 4. Tester endpoints (curl dans terminal VS Code)
curl -H "Authorization: Bearer TOKEN" "http://localhost:8000/[endpoint]"

# 5. Développement direct (plus de documentation intermédiaire)
# Split screen: backend/schemas.py + frontend/types.ts
# Copie directe des types avec adaptation TypeScript
```

### **🔥 RÈGLE ULTIME - "BACKEND FIRST avec VS Code"**
```
❌ Backend (supposé) → Frontend (code) → Backend (réalité) → Bug (frustration)

✅ Backend (VS Code nav) → Types (copie directe) → Frontend (code sûr) → Success
```

**Temps perdu à supposer : 2 heures de debug**  
**Temps gagné avec VS Code : 5 minutes de navigation + copie directe**

### **💡 EXEMPLE CONCRET - WORKFLOW OPTIMISÉ**

**✅ Nouveau workflow avec backend dans workspace** :
```bash
# 1. Navigation VS Code instantanée
# Ctrl+P → "router.py" → Sélectionner auth
# → OAuth2PasswordRequestForm avec username: str (générique)

# 2. Test immédiat (terminal intégré)
curl -X POST "/auth/login" -d "username=admin&password=test"
# → Fonctionne avec username, pas forcément email

# 3. Développement en split screen
# Gauche: backend/app/domains/auth/schemas.py
# Droite: src/features/auth/components/LoginForm.tsx
# Copie directe des validations + types

# 4. Résultat optimal
<input type="text" placeholder="Nom d'utilisateur" />
username: z.string().min(3)  // Validé contre le backend
```

**Avantages du workspace unifié :**
- ✅ **Navigation instantanée** : Ctrl+P entre frontend/backend  
- ✅ **Copie directe** : Split screen schemas.py ↔ types.ts
- ✅ **Tests intégrés** : Terminal VS Code + Hot reload
- ✅ **Zero documentation** : Plus besoin de fichiers intermédiaires
- ✅ **Développement fluide** : Tout dans un seul environnement

---

## 🚫 **RÈGLES STRICTES**

### **INTERDICTIONS**
- ❌ **CSS personnalisé** : 100% Tailwind uniquement
- ❌ **UUIDs en dur** : Toujours utiliser des sélecteurs dynamiques
- ❌ **Logique métier dans les composants** : Extraire dans des hooks
- ❌ **Appels API directs** : Toujours passer par React Query
- ❌ **Sur-architecture** : Pas de patterns complexes sans besoin réel
- ❌ **🚨 MODIFICATION BACKEND** : **INTERDIT ABSOLU** - Backend READ-ONLY uniquement

### **OBLIGATIONS**
- ✅ **Types stricts** : Tout doit être typé
- ✅ **Gestion d'erreurs** : Toujours prévoir les cas d'échec
- ✅ **Feedback utilisateur** : Loading, success, error states
- ✅ **Mobile-first** : Responsive design obligatoire
- ✅ **Accessibilité** : Utiliser les bons éléments HTML
- ✅ **🔍 BACKEND CONSULTATION** : Utiliser uniquement pour référence et copie de types

---

## 🔧 **GESTION DES DONNÉES**

### **État serveur (React Query)**
```typescript
// ✅ Bon : Hook avec React Query
export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => api.get('/students'),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

// ❌ Éviter : Store Zustand sauf besoin spécifique
```

### **État local (useState)**
- Formulaires : React Hook Form
- État UI temporaire : useState
- État partagé simple : useState + props

### **État global (Zustand - si vraiment nécessaire)**
- Authentification utilisateur
- Préférences globales
- Données partagées entre features distinctes

---

## 🎯 **GESTION DES ERREURS**

### **Stratégie d'erreur**
1. **Intercepteur Axios** : Gestion centralisée des erreurs HTTP
2. **Error Boundaries** : Capture des erreurs React
3. **Toast notifications** : Feedback utilisateur immédiat
4. **Fallback UI** : Interface de secours pour les erreurs

### **Types d'erreurs**
- **Réseau** : Connexion, timeout
- **Authentification** : Token expiré, accès refusé
- **Validation** : Données incorrectes
- **Métier** : Règles business (ex: capacité classe dépassée)

---

## 📱 **DESIGN & UX**

### **Principes UI**
- **Mobile-first** : Commencer par la version mobile
- **Design system** : Composants cohérents et réutilisables
- **Accessibility** : Labels, contraste, navigation clavier
- **Performance** : Lazy loading, optimisations images

### **Couleurs & thème**
```javascript
// Palette principale (à définir dans tailwind.config.js)
primary: 'indigo',    // Actions principales
secondary: 'gray',    // Actions secondaires
success: 'green',     // Succès
warning: 'yellow',    // Avertissements
error: 'red',         // Erreurs
```

---

## 🚀 **DÉPLOIEMENT & MAINTENANCE**

### **Checklist avant commit**
- [ ] Types TypeScript validés (VS Code affiche 0 erreur)
- [ ] Tests manuels réalisés (frontend + backend en parallèle)
- [ ] Pas d'erreurs ESLint (problèmes VS Code panel)
- [ ] Types backend synchronisés (schemas.py ↔ types.ts)
- [ ] Responsive testé (Dev Tools intégrés)

### **Workflow de développement optimisé**
1. **Feature branches** : Développement isolé
2. **Backend sync** : Navigation VS Code pour vérifier la cohérence
3. **Tests intégrés** : Terminal + Hot reload + Backend parallèle  
4. **Merge rapide** : Types validés automatiquement
5. **Feedback utilisateur** : Ajustements rapides

---

## 📈 **MÉTRIQUES DE QUALITÉ**

### **Objectifs de performance**
- **Bundle size** : < 500KB gzippé
- **First paint** : < 2s
- **Interactive** : < 3s
- **Accessibilité** : Score > 90%

### **Standards de code**
- **Type coverage** : 100%
- **ESLint errors** : 0
- **Console warnings** : 0 en production

---

*Ces règles évoluent avec le projet. L'important est la livraison de valeur rapide et la satisfaction utilisateur.*

## 🚀 **COMMANDES RAPIDES VS CODE**

### **Navigation backend optimisée**
```bash
# Ouvrir rapidement n'importe quel fichier backend
Ctrl+P → "schemas.py" → Sélectionner le domaine

# Rechercher dans tout le projet (frontend + backend)  
Ctrl+Shift+F → Recherche globale

# Aller à la définition (avec extensions Python)
F12 sur une classe/fonction

# Terminal intégré rapide
Ctrl+` → Nouveau terminal

# Split screen efficace
Ctrl+\ → Diviser l'éditeur
```

### **Workflow de développement quotidien**
```bash
# 1. Démarrage projet (VS Code workspace)
Ctrl+Shift+P → "Tasks: Run Task" → Start both servers

# 2. Navigation features
Ctrl+P → Recherche rapide fichiers
Ctrl+T → Recherche symboles

# 3. Tests intégrés  
Terminal 1: npm run dev (auto-reload)
Terminal 2: backend uvicorn (auto-reload)
Browser: Simple Browser pour Swagger

# 4. Debug efficace
F5 → Debug frontend
Console → Network tab pour API calls
VS Code Breakpoints → Debug précis
```
