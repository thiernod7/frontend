# Module Finance - Documentation

## Vue d'ensemble

Le module Finance a été entièrement refactorisé pour s'aligner avec l'architecture backend et offrir une meilleure expérience utilisateur. Il gère maintenant les types de frais de manière dynamique et offre des fonctionnalités avancées de validation et d'affichage.

## Architecture

### Structure des fichiers
```
src/features/finance/
├── api.ts                  # Hooks React Query et services API
├── types.ts               # Types TypeScript conformes au backend
├── utils/
│   └── validation.ts      # Utilitaires de validation et formatage
├── hooks/
│   └── useFinanceForm.ts  # Hooks personnalisés pour formulaires
└── components/
    ├── TypeFraisManager.tsx        # Gestion des types de frais
    ├── FinanceDisplayComponents.tsx # Composants d'affichage réutilisables
    ├── FraisForm.tsx              # Formulaire de frais (mis à jour)
    ├── FraisList.tsx              # Liste des frais (mis à jour)
    └── FraisCalculator.tsx        # Calculateur de frais (mis à jour)
```

## Nouveautés

### 1. Types de Frais Dynamiques
- **Avant**: Types de frais codés en dur dans le frontend
- **Maintenant**: Types de frais configurables via l'interface d'administration
- **Composant**: `TypeFraisManager.tsx`

### 2. Système de Types Amélioré
- **Séparation claire**: `TTypeDeFrais` vs `TFrais`
- **Type safety**: Remplacement des enums par des `const assertions`
- **Validation**: Types cohérents entre frontend et backend

### 3. Composants d'Affichage Réutilisables
- `Montant`: Affichage formaté des montants en GNF
- `StatutVersementBadge`: Badge coloré pour les statuts
- `PaymentProgressBar`: Barre de progression des paiements
- `SituationResume`: Résumé de la situation financière

### 4. Validation Avancée
- **Formatage monétaire**: Conversion automatique en francs guinéens
- **Validation des montants**: Vérification des limites min/max
- **Validation des dates**: Cohérence des échéances
- **Messages d'erreur**: Français, contextuels et utiles

### 5. Hooks Personnalisés
- `useFormValidation`: Validation de formulaire en temps réel
- `useModal`: Gestion des modales (confirmation, etc.)
- `useCrudActions`: Actions CRUD avec gestion d'état
- `useListFiltering`: Filtrage et recherche de listes

## Guide d'utilisation

### Gestion des Types de Frais

```tsx
import TypeFraisManager from '../components/TypeFraisManager';

// Utilisation simple
<TypeFraisManager />
```

Le composant `TypeFraisManager` permet de :
- ✅ Créer de nouveaux types de frais
- ✅ Modifier les types existants
- ✅ Supprimer les types avec confirmation
- ✅ Rechercher et filtrer les types
- ✅ Validation en temps réel

### Affichage des Montants

```tsx
import { Montant } from '../components/FinanceDisplayComponents';

// Affichage simple
<Montant value={50000} />
// Résultat: "50 000 GNF"

// Avec couleur conditionnelle
<Montant value={0} showZeroAsDash />
// Résultat: "—" (si montant = 0)
```

### Badges de Statut

```tsx
import { StatutVersementBadge } from '../components/FinanceDisplayComponents';

<StatutVersementBadge statut="valide" />
<StatutVersementBadge statut="en_attente" />
<StatutVersementBadge statut="annule" />
```

### Validation de Formulaire

```tsx
import { useFormValidation } from '../hooks/useFinanceForm';

const MyForm = () => {
  const { errors, validate, isValid } = useFormValidation({
    montant: '',
    description: ''
  });

  const handleSubmit = () => {
    if (validate()) {
      // Formulaire valide
    }
  };
};
```

## API et Hooks

### Hooks disponibles

```tsx
// Types de frais
const { data: typesFrais } = useTypesFrais();
const createTypeMutation = useCreateTypeFrais();
const updateTypeMutation = useUpdateTypeFrais();
const deleteTypeMutation = useDeleteTypeFrais();

// Frais
const { data: frais } = useFrais(filters);
const { data: fraisDetail } = useFraisById(id);
const createFraisMutation = useCreateFrais();
const updateFraisMutation = useUpdateFrais();
const deleteFraisMutation = useDeleteFrais();
```

### Gestion d'erreurs

Tous les hooks incluent une gestion d'erreur standardisée :

```tsx
const mutation = useCreateTypeFrais({
  onError: (error) => {
    // Gestion automatique des erreurs
    console.error('Erreur lors de la création:', error.message);
  }
});
```

## Utilitaires

### Formatage des Montants

```tsx
import { formatMontant, validateMontant } from '../utils/validation';

// Formatage
formatMontant(50000); // "50 000"
formatMontant(50000, { withCurrency: true }); // "50 000 GNF"

// Validation
validateMontant(50000); // { isValid: true }
validateMontant(-100);  // { isValid: false, error: "Le montant doit être positif" }
```

### Labels de Statut

```tsx
import { getStatutLabel, getStatutColor } from '../utils/validation';

getStatutLabel('en_attente'); // "En attente"
getStatutColor('valide');     // "green"
```

## Migration depuis l'Ancienne Version

### 1. Types de Frais
```tsx
// ❌ Avant
frais.type === 'inscription'

// ✅ Maintenant
frais.type_frais?.nom === 'inscription'
```

### 2. Création de Frais
```tsx
// ❌ Avant
const data = {
  type: 'inscription',
  montant: 50000
};

// ✅ Maintenant
const data = {
  type_frais_id: 'uuid-du-type',
  montant: 50000
};
```

### 3. Validation
```tsx
// ❌ Avant
if (!formData.type || !formData.montant) return;

// ✅ Maintenant
const { isValid, errors } = validateFraisForm(formData);
if (!isValid) {
  console.log(errors);
  return;
}
```

## Performance

### Optimisations Appliquées
- ✅ **React Query**: Mise en cache automatique des données
- ✅ **Lazy Loading**: Chargement conditionnel des composants
- ✅ **Debouncing**: Recherche optimisée avec délai
- ✅ **Memoization**: Éviter les recalculs inutiles
- ✅ **Error Boundaries**: Gestion d'erreur gracieuse

### Recommandations
- Utiliser `enabled: false` pour les requêtes conditionnelles
- Préférer `useMemo` pour les calculs coûteux
- Implémenter la pagination pour les grandes listes

## Accessibility (A11y)

- ✅ Labels appropriés pour tous les champs de formulaire
- ✅ Navigation au clavier supportée
- ✅ Messages d'erreur associés aux champs
- ✅ Contraste de couleurs conforme WCAG
- ✅ ARIA labels pour les composants interactifs

## Tests

### Structure des Tests
```
tests/
├── components/
│   ├── TypeFraisManager.test.tsx
│   └── FinanceDisplayComponents.test.tsx
├── hooks/
│   └── useFinanceForm.test.tsx
└── utils/
    └── validation.test.tsx
```

### Couverture Attendue
- ✅ **Composants**: Tests d'affichage et d'interaction
- ✅ **Hooks**: Tests de logique métier
- ✅ **Utils**: Tests de validation et formatage
- ✅ **API**: Tests d'intégration avec mock

## Roadmap

### Phase 2 (À venir)
- [ ] **Dashboard Financier**: Vue d'ensemble des finances
- [ ] **Rapports Avancés**: Export PDF/Excel
- [ ] **Notifications**: Alertes de paiement
- [ ] **Paiements en Ligne**: Intégration Mobile Money
- [ ] **Planning de Paiement**: Échéanciers automatiques

### Phase 3 (Futur)
- [ ] **Multi-devises**: Support USD/EUR
- [ ] **Comptabilité**: Module comptable complet
- [ ] **API Bancaire**: Réconciliation automatique
- [ ] **IA**: Prédiction de défauts de paiement