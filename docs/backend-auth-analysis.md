# Backend Analysis - Authentification

## 🔍 Endpoints disponibles

### ✅ CONFIRMÉS (via investigation backend)
- [x] **POST /auth/login** - Authentification utilisateur

### ❌ NON DISPONIBLES (assumptions corrigées)
- [ ] ~~GET /auth/me~~ - N'existe pas dans le backend
- [ ] ~~POST /auth/logout~~ - N'existe pas dans le backend
- [ ] ~~POST /auth/register~~ - N'existe pas dans le backend

## 📤 Format d'entrée - POST /auth/login

**Content-Type**: `application/x-www-form-urlencoded` (OAuth2PasswordRequestForm)

```typescript
interface LoginRequest {
  username: string;  // ✅ CONFIRMÉ: identifiant générique (pas forcément email)
  password: string;  // ✅ CONFIRMÉ: mot de passe en clair
  scope?: string;    // ✅ OPTIONNEL: par défaut ""
}
```

**Source de vérification** :
```python
# backend/app/domains/auth/router.py
@router.post("/login", response_model=schemas.Token)
async def login_for_access_token(
    db: AsyncSession = Depends(get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()  # ← FormData, pas JSON !
):
    user = await service.authenticate_user(
        db, username=form_data.username, password=form_data.password
    )
```

## 📥 Format de sortie - POST /auth/login

**Success (200)** :
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

**Source de vérification** :
```python
# backend/app/domains/auth/schemas.py
class Token(BaseModel):
    access_token: str
    token_type: str
```

## ⚠️ Erreurs possibles

### 401 Unauthorized
```json
{
  "detail": "Incorrect username or password"
}
```

**Source de vérification** :
```python
# backend/app/domains/auth/router.py
if not user:
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",  # ← Message exact
        headers={"WWW-Authenticate": "Bearer"},
    )
```

### 422 Validation Error
Si les champs requis manquent (username/password vides)

## 🧪 Tests effectués

### ✅ Cas nominal
```bash
curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin&password=validpassword"
```

### ✅ Cas d'erreur testés
```bash
# Identifiants incorrects
curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=wrong&password=wrong"

# Champs manquants
curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=&password="
```

## 💾 Base de données - Modèle User

```sql
-- backend/app/domains/auth/models.py
users (
    id: UUID PRIMARY KEY,
    personne_id: UUID NOT NULL,
    role_id: UUID NOT NULL,
    username: VARCHAR UNIQUE NOT NULL,  -- ✅ Identifiant unique (pas email)
    password_hash: VARCHAR NOT NULL,
    is_active: BOOLEAN DEFAULT TRUE,
    last_login: TIMESTAMP,
    created_at: TIMESTAMP DEFAULT NOW()
)
```

## 🔄 Processus d'authentification

1. **Réception** : FormData avec username/password
2. **Recherche utilisateur** : `SELECT * FROM users WHERE username = ?`
3. **Vérification mot de passe** : `verify_password(password, user.password_hash)`
4. **Génération token** : JWT avec payload `{"sub": user.username}`
5. **Retour** : `{"access_token": "...", "token_type": "bearer"}`

## 📋 Corrections apportées au frontend

### ❌ Avant (basé sur assumptions)
```tsx
// On supposait que username = email
<input type="email" placeholder="your@email.com" />
username: z.string().email('Format email invalide')
```

### ✅ Après (basé sur investigation)
```tsx
// Aligné avec la réalité du backend
<input type="text" placeholder="Nom d'utilisateur" />
username: z.string().min(3, 'Au moins 3 caractères')
```

## 🎯 Leçons apprises

1. **Never assume** : Le backend utilise `username` générique, pas forcément email
2. **Always verify** : OAuth2PasswordRequestForm utilise FormData, pas JSON
3. **Test everything** : Un seul endpoint d'auth disponible (/login), pas de /me ou /logout
4. **Document findings** : Cette analyse évite les erreurs futures

---
**Date d'analyse** : 2 septembre 2025  
**Status** : ✅ Frontend aligné avec backend  
**Prochaine feature** : Élèves/Students (appliquer la même méthodologie)
