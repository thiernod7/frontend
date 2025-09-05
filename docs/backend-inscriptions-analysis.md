# Backend Analysis - Inscriptions (Students Registration)

## 🔍 Endpoints disponibles

### ✅ CONFIRMÉS (via investigation backend)

#### **GET /inscriptions/eleves** - Liste des élèves
- **Permissions**: `voir_eleves`
- **Query Parameters**:
  - `search?: string` - Recherche par nom, prénom, ou matricule
  - `classe_id?: UUID` - Filtrer par classe
- **Response**: `List[EleveRead]`

#### **GET /inscriptions/eleves/{eleve_id}** - Détail élève
- **Permissions**: `voir_eleves`
- **Path Parameter**: `eleve_id: UUID`
- **Response**: `EleveDetailRead`

#### **POST /inscriptions/** - Créer inscription
- **Permissions**: `inscrire_eleve`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `inscription_data: string` (JSON encodé de InscriptionCreate)
  - `photo_eleve?: File`
  - `photo_pere?: File`
  - `photo_mere?: File`
  - `photo_tuteur?: File`
- **Response**: `InscriptionRead`

## 📤 Format d'entrée - InscriptionCreate ⚠️ **NOUVEAU FORMAT**

```json
{
  "eleve": {
    "nom": "string",
    "prenom": "string", 
    "sexe": "string",
    "telephone": "string",
    "adresse_quartier": "string",
    "date_naissance": "date", 
    "lieu_naissance": "string",
    "site_id": "uuid?" // Optional
  },
  "pere": {                 // OPTIONNEL
    "id": "uuid?",          // Père existant OU
    "data": {               // Nouveau père
      "nom": "string",
      "prenom": "string",
      "sexe": "string", 
      "telephone": "string",
      "adresse_quartier": "string",
      "profession": "string?",
      "lieu_travail": "string?"
    }
  },
  "mere": {                 // OPTIONNEL
    "id": "uuid?",          // Mère existante OU  
    "data": {               // Nouvelle mère
      "nom": "string",
      "prenom": "string",
      "sexe": "string",
      "telephone": "string", 
      "adresse_quartier": "string",
      "profession": "string?",
      "lieu_travail": "string?"
    }
  },
  "tuteur_role": "pere" | "mere" | "autre",  // OBLIGATOIRE - NOUVEAU !
  "tuteur_data": {          // OBLIGATOIRE seulement si tuteur_role = "autre"
    "id": "uuid?",          // Tuteur existant OU
    "data": {               // Nouveau tuteur
      "nom": "string",
      "prenom": "string",
      "sexe": "string",
      "telephone": "string",
      "adresse_quartier": "string", 
      "profession": "string?",
      "lieu_travail": "string?"
    }
  },
  "classe_id": "uuid",          // OBLIGATOIRE
  "site_id": "uuid?",           // Optional
  "annee_scolaire_id": "uuid",  // OBLIGATOIRE
  "frais_inscription": "float?",// Optional
  "frais_scolarite": "float?",  // Optional
  "documents_fournis": [        // Optional
    {
      "type_document_id": "uuid",
      "reference": "string?"
    }
  ]
}
```

## 📥 Formats de sortie

### **EleveRead** (Liste)
```json
{
  "id": "uuid",
  "numero_matricule": "string",
  "date_naissance": "date",
  "lieu_naissance": "string",
  "personne": {
    "id": "uuid",
    "nom": "string",
    "prenom": "string",
    "sexe": "string",
    "telephone": "string", 
    "adresse_quartier": "string",
    "photo": "string?",
    "type": "string"
  },
  "classe_actuelle": {
    "id": "uuid",
    "nom": "string",
    "niveau": "string"
  }
}
```

### **EleveDetailRead** (Détail)
```json
{
  // ... tous les champs de EleveRead +
  "pere": {
    "personne": "PersonneRead",
    "profession": "string?",
    "lieu_travail": "string?"
  },
  "mere": {
    "personne": "PersonneRead", 
    "profession": "string?",
    "lieu_travail": "string?"
  },
  "tuteur": {
    "personne": "PersonneRead",
    "profession": "string?", 
    "lieu_travail": "string?"
  },
  "inscriptions": [
    {
      "id": "uuid",
      "statut": "string",
      "date_inscription": "date",
      "classe": "ClasseInfo",
      "annee_scolaire": "AnneeScolaireRead"
    }
  ]
}
```

### **InscriptionRead** (Création)
```json
{
  "id": "uuid",
  "eleve_id": "uuid",
  "classe_id": "uuid", 
  "site_id": "uuid?",
  "annee_scolaire_id": "uuid",
  "statut": "string"
}
```

## ⚠️ Contraintes identifiées

### **🔥 NOUVELLES RÈGLES TUTEUR** (Version mise à jour)
- ✅ **tuteur_role OBLIGATOIRE** : doit être "pere", "mere" ou "autre"
- ✅ **Si tuteur_role = "pere"** : 
  - Le champ `pere` DOIT être fourni
  - Le champ `tuteur_data` DOIT être `null`
- ✅ **Si tuteur_role = "mere"** :
  - Le champ `mere` DOIT être fourni  
  - Le champ `tuteur_data` DOIT être `null`
- ✅ **Si tuteur_role = "autre"** :
  - Le champ `tuteur_data` DOIT être fourni
  - Les champs `pere`/`mere` sont optionnels

### **Business Rules**
- ✅ **ParentLink validation** : soit `id` (existant) soit `data` (nouveau), pas les deux
- ✅ **classe_id et annee_scolaire_id OBLIGATOIRES**
- ✅ **Multi-site supporté** (site_id optionnel)

### **Upload de fichiers**
- ✅ **Content-Type**: `multipart/form-data`
- ✅ **inscription_data**: JSON stringifié en champ Form
- ✅ **4 photos possibles**: élève, père, mère, tuteur
- ✅ **Toutes photos optionnelles** 

### **Champs requis vs optionnels**
#### **OBLIGATOIRES pour élève:**
- nom, prenom, sexe, telephone, adresse_quartier
- date_naissance, lieu_naissance

#### **OBLIGATOIRES pour tuteur:**
- nom, prenom, sexe, telephone, adresse_quartier

#### **OPTIONNELS:**
- profession, lieu_travail (tous parents)
- site_id (élève et inscription)
- frais_inscription, frais_scolarite
- documents_fournis

## ⚠️ Erreurs possibles

### **400 Bad Request**
```json
{
  "detail": "Invalid JSON format for inscription_data"
}
```

### **403 Forbidden**
```json
{
  "detail": "Insufficient permissions"
}
```

### **404 Not Found** (GET)
```json
{
  "detail": "Student not found or not in your school"
}
```

### **422 Validation Error**
```json
{
  "detail": [
    {
      "loc": ["body", "inscription_data", "eleve", "nom"],
      "msg": "field required",
      "type": "missing"
    }
  ]
}
```

## 🧪 Tests effectués

### ✅ Investigation schemas
- ✅ inscriptions/schemas.py analysé
- ✅ inscriptions/router.py analysé 
- ✅ personnes/schemas.py analysé

### ✅ Contraintes validées
- ✅ ParentLink avec validation soit id soit data
- ✅ Tuteur obligatoire confirmé
- ✅ Multipart form-data avec JSON stringifié
- ✅ Upload photos multiples supporté

### ⚠️ Tests endpoints à faire
- [ ] POST /inscriptions/ avec données complètes
- [ ] POST /inscriptions/ avec photos
- [ ] Validation des erreurs 422

## 🎯 Implications Frontend

### **Formulaire multi-étapes nécessaire**
1. **Étape 1**: Données élève + classe/année
2. **Étape 2**: Tuteur (obligatoire)
3. **Étape 3**: Parents père/mère (optionnels)
4. **Étape 4**: Upload photos (4 zones de drop)
5. **Étape 5**: Confirmation et soumission

### **Gestion ParentLink**
- Interface pour choisir parent existant OU créer nouveau
- Validation front pour empêcher id ET data simultanément

### **FormData construction**
```typescript
const formData = new FormData();
formData.append('inscription_data', JSON.stringify(inscriptionData));
if (photoEleve) formData.append('photo_eleve', photoEleve);
if (photoPere) formData.append('photo_pere', photoPere);
if (photoMere) formData.append('photo_mere', photoMere);
if (photoTuteur) formData.append('photo_tuteur', photoTuteur);
```

---
**Date d'analyse** : 5 septembre 2025  
**Status** : ✅ Investigation terminée - Prêt pour implémentation  
**Endpoint key** : `POST /inscriptions/` avec multipart/form-data + JSON stringifié

## 🔧 Adaptations Frontend Réalisées

### 1. Types TypeScript mis à jour (src/features/students/types.ts)
- ✅ Interface `TInscriptionCreate` mise à jour avec les nouveaux champs
- ✅ `tuteur_role` ajouté avec type union `'pere' | 'mere' | 'autre'`
- ✅ `tuteur_data` ajouté avec structure conditionnelle

### 2. Logique de construction des données (StudentForm.tsx)
- ✅ Construction adaptée pour utiliser `tuteur_role` au lieu de `tuteur`
- ✅ Logique conditionnelle pour `tuteur_data` (seulement si `tuteur_role === 'autre'`)
- ✅ Validation côté frontend des règles backend

### 3. Validations ajoutées
- ✅ Vérification que le parent désigné comme tuteur existe
- ✅ Validation des données tuteur complètes si `tuteur_role === 'autre'`
- ✅ Contrôle qu'au moins un parent est renseigné
- ✅ Messages d'erreur explicites avec logging

### 4. Logging intégré
- ✅ Suivi des étapes de construction des données
- ✅ Logging des validations et erreurs
- ✅ Traçabilité complète du processus d'inscription

### 5. Compilation vérifiée
- ✅ Code compile sans erreurs TypeScript
- ✅ Build production réussie
- ✅ Prêt pour tests d'intégration
