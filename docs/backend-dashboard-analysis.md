# Backend Analysis - Dashboard

## 🔍 Endpoints disponibles pour statistiques

### ✅ CONFIRMÉS (via investigation backend)

#### 🎓 **ÉLÈVES & INSCRIPTIONS**
- [x] **GET /inscriptions/eleves** - Liste des élèves avec filtres (search, classe_id)
- [x] **GET /inscriptions/eleves/{id}** - Détail élève complet (parents, inscriptions)

#### 📅 **PLANIFICATION**
- [x] **GET /planification/classes** - Liste des classes (annee_scolaire_id, site_id, active_only)
- [x] **GET /planification/annees-scolaires/actuelle** - Année scolaire courante
- [x] **GET /planification/annees-scolaires** - Liste toutes années scolaires

#### 💰 **FINANCE**
- [x] **GET /finance/frais** - Types de frais configurés
- [x] **GET /finance/eleves/{eleve_id}/situation-financiere** - Situation financière élève

#### 📚 **CURSUS**
- [x] **GET /cursus/cycles** - Cycles d'études (active_only)
- [x] **GET /cursus/niveaux** - Niveaux scolaires (cycle_id, active_only)

#### 📄 **DOCUMENTS**
- [x] **GET /documents/types** - Types de documents requis

#### 👥 **PERSONNES**
- [x] **GET /personnes/** - Liste personnes (type, search filters)

## 📊 STRUCTURES DE DONNÉES POUR DASHBOARD

### 🎓 **Stats Élèves**
```typescript
interface EleveRead {
  id: string;
  numero_matricule: string;
  date_naissance: string;
  lieu_naissance: string;
  personne: {
    id: string;
    nom: string;
    prenom: string;
    type: string;
  };
}
```

### 📅 **Stats Classes**
```typescript
interface ClasseRead {
  id: string;
  nom: string;
  is_active: boolean;
  // + relationships ecole, niveau
}

interface AnneeScolaireRead {
  id: string;
  annee: string;
  date_debut: string;
  date_fin: string;
  is_active: boolean;
}
```

### 💰 **Stats Finance**
```typescript
interface SituationFinanciereRead {
  annee_scolaire: string;
  eleve: {
    nom: string;
    prenom: string;
    numero_matricule: string;
  };
  resume: {
    total_frais: number;
    total_verse: number;
    solde: number;
    pourcentage_paye: number;
  };
}
```

### 📚 **Stats Cursus**
```typescript
interface CycleRead {
  id: string;
  nom: string;
  description: string;
  is_active: boolean;
}

interface NiveauRead {
  id: string;
  nom: string;
  description: string;
  cycle_id: string;
  is_active: boolean;
}
```

## 🎯 WIDGETS DASHBOARD POSSIBLES

### 📊 **Widget Statistiques Générales**
- Total élèves (COUNT depuis GET /inscriptions/eleves)
- Total classes (COUNT depuis GET /planification/classes)
- Année scolaire courante (GET /planification/annees-scolaires/actuelle)
- Total cycles/niveaux actifs

### 💰 **Widget Finance**
- Élèves en règle vs en retard (analyse situations financières)
- Montant total collecté
- Taux de recouvrement

### 📋 **Widget Activité Récente**
- Dernières inscriptions créées
- Documents en attente
- Classes récemment créées

### 🎓 **Widget Répartition**
- Élèves par classe (graphique)
- Élèves par niveau/cycle
- Répartition par âge

## ⚠️ LIMITATIONS IDENTIFIÉES

### ❌ **ENDPOINTS MANQUANTS pour stats**
- [ ] ~~GET /dashboard/stats~~ - Pas d'endpoint dédié stats
- [ ] ~~GET /inscriptions/count~~ - Pas de count direct
- [ ] ~~GET /finance/summary~~ - Pas de résumé financier global

### 🔄 **SOLUTIONS DE CONTOURNEMENT**
1. **Compter côté frontend** : Récupérer listes complètes et compter
2. **Agrégations manuelles** : Calculer stats à partir des données détaillées  
3. **Cache intelligent** : Stocker les stats calculées avec React Query

## 🧪 Tests à effectuer

### ✅ Cas nominaux
```bash
# Tester récupération année courante
curl -X GET "http://localhost:8000/planification/annees-scolaires/actuelle" \
     -H "Authorization: Bearer TOKEN"

# Tester liste élèves
curl -X GET "http://localhost:8000/inscriptions/eleves" \
     -H "Authorization: Bearer TOKEN"

# Tester liste classes
curl -X GET "http://localhost:8000/planification/classes" \
     -H "Authorization: Bearer TOKEN"
```

### ⚠️ Gestion d'erreurs
- **401**: Token expiré/invalide
- **403**: Permissions insuffisantes  
- **404**: Ressource introuvable

## 🎯 STRATÉGIE DASHBOARD

### **Approche 1 : Dashboard Léger** ⭐ **RECOMMANDÉ**
- 4-5 widgets simples
- Données en temps réel via React Query
- Navigation vers sections détaillées

### **Approche 2 : Dashboard Riche**
- Stats complexes avec graphiques
- Nécessite plus d'appels API
- Risque de surcharge

## 🚀 PLAN D'IMPLÉMENTATION

1. **Widget Stats de base** (élèves, classes, année courante)
2. **Widget Navigation** (liens vers features principales)
3. **Widget Activité** (données récentes si disponibles)
4. **Widget Finance** (si permissions appropriées)

---
**Date d'analyse** : 3 septembre 2025  
**Status** : ✅ Prêt pour phase 2 - Setup Frontend  
**Recommandation** : Dashboard léger avec navigation efficace
