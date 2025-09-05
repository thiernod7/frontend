# Backend Analysis - Students (Inscriptions)

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
  - `inscription_data: string` (JSON encodé)
  - `photo_eleve?: File`
  - `photo_pere?: File`
  - `photo_mere?: File`
  - `photo_tuteur?: File`
- **Response**: `InscriptionRead`

### ❌ NON DISPONIBLES (vérification faite)
- [ ] ~~PUT /inscriptions/eleves/{id}~~ - Modification élève
- [ ] ~~DELETE /inscriptions/eleves/{id}~~ - Suppression élève
- [ ] ~~GET /inscriptions/eleves/{id}/photo~~ - Upload photo séparé

## 📤 Formats d'entrée

### **GET /inscriptions/eleves** (Liste)
```typescript
interface GetStudentsParams {
  search?: string;      // Recherche libre
  classe_id?: string;   // UUID de la classe
}
```

### **GET /inscriptions/eleves/{id}** (Détail)
```typescript
interface GetStudentParams {
  eleve_id: string;     // UUID de l'élève
}
```

### **POST /inscriptions/** (Création)
```typescript
// FormData structure
interface CreateInscriptionFormData {
  inscription_data: string;     // JSON stringifié de InscriptionCreate
  photo_eleve?: File;          // Photo élève
  photo_pere?: File;           // Photo père (optionnel)
  photo_mere?: File;           // Photo mère (optionnel)
  photo_tuteur?: File;         // Photo tuteur
}

// JSON dans inscription_data
interface InscriptionCreate {
  eleve: {
    nom: string;
    prenom: string;
    sexe: string;
    telephone: string;
    adresse_quartier: string;
    date_naissance: string;      // ISO date
    lieu_naissance: string;
    site_id?: string;           // UUID optionnel
  };
  pere?: ParentLink;            // id OU data
  mere?: ParentLink;            // id OU data  
  tuteur: ParentLink;           // OBLIGATOIRE
  classe_id: string;            // UUID
  site_id?: string;            // UUID optionnel
  annee_scolaire_id: string;   // UUID
  frais_inscription?: number;
  frais_scolarite?: number;
  documents_fournis?: DocumentFourniCreate[];
}

interface ParentLink {
  id?: string;                 // UUID parent existant
  data?: {                     // OU nouvelles données
    nom: string;
    prenom: string;
    sexe: string;
    telephone: string;
    adresse_quartier: string;
    profession?: string;
    lieu_travail?: string;
  };
}
```

## 📥 Formats de sortie

### **EleveRead** (Liste)
```typescript
interface Student {
  id: string;                   // UUID
  numero_matricule: string;     // Matricule unique
  date_naissance: string;       // ISO date
  lieu_naissance: string;
  personne: {
    id: string;
    nom: string;
    prenom: string;
    sexe: string;
    telephone: string;
    adresse_quartier: string;
    photo?: string;             // URL photo
    type: string;
  };
  classe_actuelle?: {
    id: string;
    nom: string;
    niveau: string;
  };
}
```

### **EleveDetailRead** (Détail)
```typescript
interface StudentDetail extends Student {
  pere?: {
    personne: PersonneRead;
    profession?: string;
    lieu_travail?: string;
  };
  mere?: {
    personne: PersonneRead;
    profession?: string;
    lieu_travail?: string;
  };
  tuteur: {
    personne: PersonneRead;
    profession?: string;
    lieu_travail?: string;
  };
  inscriptions: {
    id: string;
    statut: string;
    date_inscription: string;
    classe: ClasseInfo;
    annee_scolaire: AnneeScolaireRead;
  }[];
}
```

### **InscriptionRead** (Création)
```typescript
interface InscriptionResult {
  id: string;                   // UUID
  eleve_id: string;            // UUID
  classe_id: string;           // UUID
  site_id?: string;            // UUID optionnel
  annee_scolaire_id: string;   // UUID
  statut: string;              // Status inscription
}
```

## ⚠️ Erreurs possibles

### **403 Forbidden**
```json
{
  "detail": "Insufficient permissions"
}
```

### **404 Not Found** (GET /eleves/{id})
```json
{
  "detail": "Student not found or not in your school"
}
```

### **400 Bad Request** (POST /)
```json
{
  "detail": "Invalid JSON format for inscription_data"
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

## 🏗️ Architecture Base de données

### **Tables principales**
- **eleves**: Données élève + relations parents
- **personnes**: Informations personnelles (élève + parents)
- **inscriptions**: Liens élève-classe-année
- **parents**: Détails professionnels parents

### **Relations importantes**
- Élève → Personne (1:1)
- Élève → Père/Mère/Tuteur (3 FK vers Personne)
- Élève → Inscriptions (1:N)
- Inscription → Classe (N:1)
- Inscription → Année scolaire (N:1)

## 💾 Contraintes identifiées

### **Business Rules**
- ✅ **Tuteur OBLIGATOIRE** (père/mère optionnels)
- ✅ **Matricule unique** (généré automatiquement)
- ✅ **Multi-site supporté** (site_id optionnel)
- ✅ **Multi-tenant** (filtrage automatique par école)

### **Permissions nécessaires**
- `voir_eleves` : Lecture des élèves
- `inscrire_eleve` : Création d'inscriptions

### **Upload de fichiers**
- ✅ **4 photos possibles** : élève, père, mère, tuteur
- ✅ **Format multipart** : Photos + JSON dans même requête
- ❌ **Pas d'endpoint séparé** pour upload photos

## 🧪 Tests effectués

### ✅ Cas nominal
```bash
# Liste des élèves
curl -X GET "http://localhost:8000/inscriptions/eleves" \
     -H "Authorization: Bearer $TOKEN"

# Détail élève
curl -X GET "http://localhost:8000/inscriptions/eleves/{uuid}" \
     -H "Authorization: Bearer $TOKEN"
```

### ✅ Cas d'erreur testés
```bash
# Élève inexistant
curl -X GET "http://localhost:8000/inscriptions/eleves/00000000-0000-0000-0000-000000000000" \
     -H "Authorization: Bearer $TOKEN"

# Sans autorisation
curl -X GET "http://localhost:8000/inscriptions/eleves"
```

## 🎯 Stratégie Frontend

### **Pages nécessaires**
1. **📋 Liste des élèves** : Tableau avec recherche/filtres
2. **👤 Détail élève** : Vue complète avec parents/inscriptions  
3. **➕ Nouveau élève** : Formulaire création avec photos
4. **✏️ Modifier élève** : ❌ PAS D'ENDPOINT - À éviter ou demander

### **Composants clés**
- `StudentsList` : Tableau paginé avec recherche
- `StudentDetail` : Affichage complet élève + famille
- `StudentForm` : Formulaire création (complexe!)
- `PhotoUpload` : Composant upload multiple
- `ParentSelector` : Sélection parent existant OU création

### **Défis identifiés**
1. **Formulaire complexe** : Élève + Parents + Photos + Documents
2. **ParentLink logic** : Choisir parent existant OU créer nouveau
3. **Upload multiple** : 4 photos optionnelles à gérer
4. **Validation robuste** : Nombreux champs obligatoires

## 🚨 Points d'attention

### **⚠️ Limitations backend**
- **Pas de modification** : Seulement création (POST)
- **Pas de suppression** : Pas d'endpoint DELETE
- **Upload groupé** : Toutes les photos dans une seule requête

### **🎯 Recommandations frontend**
1. **Commencer simple** : Liste + Détail seulement
2. **Formulaire en phases** : V1 basique, V2 avec photos
3. **Gestion d'état** : React Query pour cache élèves
4. **UX claire** : Beaucoup de champs, bien organiser

---
**Date d'analyse** : 3 septembre 2025  
**Status** : ✅ Investigation terminée  
**Prochaine étape** : Setup Frontend (Types + API + Structure)
