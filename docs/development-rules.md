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

#### **Phase 1 : Investigation Backend (30 min - CRITIQUE)**
⚠️ **RÈGLE D'OR : "NEVER ASSUME, ALWAYS VERIFY"**

1. **🔍 Analyser l'API RÉELLE** :
   ```bash
   # OBLIGATOIRE : Explorer les routers
   find ../backend/app/domains -name "router.py" -exec echo "=== {} ===" \; -exec cat {} \;
   
   # OBLIGATOIRE : Vérifier le main.py
   cat ../backend/app/main.py  
   
   # OBLIGATOIRE : Examiner les modèles de données
   find ../backend/app/domains -name "models.py" -exec echo "=== {} ===" \; -exec cat {} \;
   
   # OBLIGATOIRE : Comprendre les schemas
   find ../backend/app/domains -name "schemas.py" -exec echo "=== {} ===" \; -exec cat {} \;
   ```

2. **📖 Documentation FastAPI** :
   - Démarrer le backend : `cd ../backend && uvicorn app.main:app --reload`
   - Consulter : `http://localhost:8000/docs` (Swagger UI)
   - **COPIER-COLLER les endpoints exacts, structures JSON, paramètres**
   - **TESTER les endpoints avec l'interface Swagger**

3. **🧪 Validation des assumptions** :
   ```bash
   # Tester les endpoints avec curl
   curl -X POST "http://localhost:8000/auth/login" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=test&password=test123"
   
   # Examiner les réponses d'erreur
   curl -X POST "http://localhost:8000/auth/login" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=wrong&password=wrong"
   ```

4. **📝 Documentation des findings** :
   - Créer `docs/backend-analysis-[feature].md`
   - Noter TOUS les endpoints disponibles
   - Documenter les formats de données EXACTS
   - Identifier les types de données, validations, erreurs

#### **Phase 2 : Setup Frontend (20 min)**
1. **Créer la structure** :
   ```bash
   src/features/nom-feature/
   ├── api.ts       # Endpoints + hooks React Query
   ├── types.ts     # Types TypeScript (copie des schemas backend)
   └── components/  # Composants de la feature
   ```

2. **Définir les types** : Copier/adapter les types du backend
3. **Créer les hooks API** : Un hook par endpoint principal

#### **Phase 3 : Développement UI (90 min)**
1. **Composants simples** : Formulaires, listes, détails
2. **Assembly** : Créer la page qui utilise les composants
3. **Test en temps réel** : Vérifier avec le serveur de dev

#### **Phase 4 : Finalisation (10 min)**
1. **Routing** : Ajouter les routes dans `app/router.tsx`
2. **Documentation** : Mettre à jour STATUS.md
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

#### **🔍 Checklist Investigation Backend**
Avant de coder QUOI QUE CE SOIT :

- [ ] **Router analysé** : J'ai lu le fichier router.py complet
- [ ] **Endpoint testé** : J'ai testé l'endpoint avec curl ou Postman
- [ ] **Schema vérifié** : J'ai lu le schema Pydantic correspondant
- [ ] **Erreurs documentées** : J'ai listé TOUTES les erreurs possibles (400, 401, 422, 500)
- [ ] **Format confirmé** : Content-Type, structure des données validées
- [ ] **Documentation Swagger** : J'ai consulté /docs du backend

#### **📝 Documentation obligatoire**
Pour chaque feature, créer `docs/backend-[feature]-analysis.md` :

```markdown
# Backend Analysis - [Feature Name]

## 🔍 Endpoints disponibles
- [ ] GET /endpoint1 - Description
- [ ] POST /endpoint2 - Description

## 📤 Formats d'entrée
\`\`\`json
{
  "field1": "string",
  "field2": "number"
}
\`\`\`

## 📥 Formats de sortie
\`\`\`json
{
  "result": "object"
}
\`\`\`

## ⚠️ Erreurs possibles
- 400: Bad Request - Détail
- 401: Unauthorized - Détail
- 422: Validation Error - Détail
- 500: Internal Error - Détail

## 🧪 Tests effectués
- [ ] Cas nominal testé
- [ ] Cas d'erreur testés
- [ ] Edge cases identifiés
```

#### **🚦 Règle des 3 Vérifications**
Avant de passer en prod, TOUJOURS :

1. **Backend Code Review** : Re-lire le code backend une dernière fois
2. **Integration Test** : Tester avec le vrai backend démarré  
3. **Error Cases** : Provoquer TOUTES les erreurs possibles

### **🔧 WORKFLOW ANTI-ASSUMPTION**

#### **Étape 1 : EXPLORATION (pas de code)**
```bash
# Ne PAS coder avant d'avoir fait ça !
cd ../backend
find . -name "*.py" -path "*/[FEATURE]/*" | xargs cat > /tmp/backend-analysis.txt
grep -r "class.*BaseModel" app/domains/[FEATURE]/ 
grep -r "@router\." app/domains/[FEATURE]/
```

#### **Étape 2 : VALIDATION (tester avant de coder)**
```bash
# Démarrer le backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Tester CHAQUE endpoint
curl -X GET "http://localhost:8000/[endpoint]"
curl -X POST "http://localhost:8000/[endpoint]" -H "Content-Type: application/json" -d '{}'

# Vérifier la doc
open http://localhost:8000/docs
```

#### **Étape 3 : IMPLEMENTATION (coder avec certitude)**
Maintenant seulement, écrire le code frontend avec la CERTITUDE que :
- Les endpoints existent
- Les formats sont corrects  
- Les erreurs sont gérées
- Les types correspondent

### **🚨 SIGNAUX D'ALARME**
Si tu te dis :
- "Ça devrait être comme ça..."  → 🚨 STOP, VERIFY!
- "Normalement l'API fait..."    → 🚨 STOP, VERIFY!  
- "Dans la plupart des cas..."   → 🚨 STOP, VERIFY!
- "Je suppose que..."            → 🚨 STOP, VERIFY!

### **💡 EXEMPLE CONCRET - LEÇON APPRISE**

**❌ Ce qu'on a fait (MAL)** :
```typescript
// On a supposé que username = email
<input type="email" placeholder="your@email.com" />
username: z.string().email()
```

**✅ Ce qu'on aurait dû faire** :
```bash
# 1. Vérifier le backend d'abord
cat ../backend/app/domains/auth/router.py
# → OAuth2PasswordRequestForm avec username: str (générique)

# 2. Tester l'endpoint
curl -X POST "/auth/login" -d "username=admin&password=test"
# → Fonctionne avec username, pas forcément email

# 3. Coder en conséquence
<input type="text" placeholder="Nom d'utilisateur" />
username: z.string().min(3)
```

---

## 🚫 **RÈGLES STRICTES**

### **INTERDICTIONS**
- ❌ **CSS personnalisé** : 100% Tailwind uniquement
- ❌ **UUIDs en dur** : Toujours utiliser des sélecteurs dynamiques
- ❌ **Logique métier dans les composants** : Extraire dans des hooks
- ❌ **Appels API directs** : Toujours passer par React Query
- ❌ **Sur-architecture** : Pas de patterns complexes sans besoin réel

### **OBLIGATIONS**
- ✅ **Types stricts** : Tout doit être typé
- ✅ **Gestion d'erreurs** : Toujours prévoir les cas d'échec
- ✅ **Feedback utilisateur** : Loading, success, error states
- ✅ **Mobile-first** : Responsive design obligatoire
- ✅ **Accessibilité** : Utiliser les bons éléments HTML

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
- [ ] Types TypeScript validés
- [ ] Tests manuels réalisés
- [ ] Pas d'erreurs ESLint
- [ ] STATUS.md mis à jour
- [ ] Responsive testé

### **Stratégie de release**
1. **Feature branches** : Développement isolé
2. **Review rapide** : Validation fonctionnelle
3. **Merge main** : Déploiement automatique
4. **Feedback utilisateur** : Ajustements rapides

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
