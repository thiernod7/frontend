# Filtres des Étudiants - Version Simplifiée

## Vue d'ensemble

Interface de filtrage simple et efficace pour la page des étudiants avec seulement les filtres essentiels.

## Fonctionnalités

### 1. Recherche textuelle ✅
- Recherche par nom, prénom, téléphone
- Saisie en temps réel
- **Support backend**: Complet

### 2. Filtre par classe ✅
- Liste déroulante avec toutes les classes actives
- Format: "Nom de la classe - Niveau"
- Bouton de suppression rapide
- **Support backend**: Complet

### 3. Filtre par genre 🚧
- Sélection Masculin/Féminin avec icônes 👦👧
- **Status**: Temporairement désactivé
- **Raison**: Le backend ne supporte pas encore ce paramètre
- **Support backend**: En attente

## Interface

- **Design compact** : Tout dans un seul panneau
- **Bouton "Effacer les filtres"** : Visible uniquement quand des filtres sont actifs
- **Layout responsive** : Grid sur 2 colonnes sur desktop
- **Indicateurs de status** : Les fonctionnalités non disponibles sont clairement marquées

## Types

```typescript
interface TStudentSearchParams {
  search?: string;      // ✅ Supporté
  classe_id?: string;   // ✅ Supporté  
  sexe?: 'M' | 'F';    // 🚧 En attente backend
  page?: number;        // ✅ Supporté
  limit?: number;       // ✅ Supporté
}
```

## Utilisation

```tsx
<FilterPanel
  filters={searchParams}
  onFiltersChange={setSearchParams}
  onReset={() => setSearchParams({})}
  isLoading={isLoading}
/>
```

## Backend - À implémenter

Pour activer le filtre par genre, il faut ajouter au backend :

1. **Router** (`/backend/app/domains/inscriptions/router.py`) :
```python
@router.get("/eleves", response_model=List[schemas.EleveRead])
async def get_eleves(
    search: Optional[str] = Query(None),
    classe_id: Optional[uuid.UUID] = Query(None),
    sexe: Optional[str] = Query(None, regex="^(M|F)$"),  # ← Ajouter
    # ...
):
```

2. **Service** (`/backend/app/domains/inscriptions/service.py`) :
```python
async def get_all_eleves(
    db: AsyncSession,
    ecole_id: uuid.UUID,
    search: str | None,
    classe_id: uuid.UUID | None,
    sexe: str | None,  # ← Ajouter
) -> List[schemas.EleveRead]:
```

3. **CRUD** - Créer `get_eleves` dans `crud.py` avec filtre SQL par `personne.sexe`

Une fois le backend mis à jour, supprimer `disabled={true}` du composant FilterPanel.