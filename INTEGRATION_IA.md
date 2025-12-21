# Intégration IA - Frontend ↔ Backend

## ✅ Ce qui a été fait

### Backend

- Endpoint `/recipes/generate` déjà configuré dans `backend/app/routes/recipes.py`
- Service AI configuré avec Google Gemini dans `backend/app/services/ai.py`
- Authentification JWT requise pour générer des recettes

### Frontend

- Nouveau service API créé dans `src/services/api.ts`
- Fonction `generateAiRecipes()` modifiée dans `HomePage.tsx` pour appeler le backend
- Gestion des états de chargement et des erreurs
- Interface utilisateur mise à jour avec feedback visuel

## 🚀 Comment tester

### 1. Configurer le backend

Créez un fichier `.env` dans le dossier `backend/` :

```bash
cd backend
cp .env.example .env
```

Éditez `backend/.env` et configurez :

```env
# MongoDB (remplacez par vos identifiants)
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/APP5
DATABASE_NAME=APP5

# JWT Secret (générez une clé aléatoire sécurisée)
SECRET_KEY=votre_cle_secrete_super_longue_et_aleatoire
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Clé API Gemini (obligatoire pour l'IA)
GEMINI_API_KEY=votre_cle_api_gemini
```

Pour obtenir une clé Gemini API :

1. Allez sur https://makersuite.google.com/app/apikey
2. Créez une nouvelle clé API
3. Copiez-la dans votre `.env`

### 2. Installer les dépendances backend

```bash
cd backend
pip install -r requirements.txt
```

### 3. Lancer le backend

```bash
cd backend
python run.py
```

Le backend sera disponible sur `http://localhost:8000`

### 4. Lancer le frontend

Dans un autre terminal :

```bash
npm install
npm start
```

Le frontend sera disponible sur `http://localhost:3000`

### 5. Tester la génération de recettes

1. **Créer un compte** (si pas déjà fait) :
   - Cliquez sur "Se connecter" dans l'interface
   - Puis "S'inscrire"
   - Remplissez le formulaire

2. **Se connecter** :
   - Email et mot de passe
   - Le token JWT sera automatiquement stocké

3. **Générer une recette** :
   - Ajoutez des ingrédients (ex: tomates, poulet, oignons)
   - Cliquez sur "Générer avec IA"
   - Attendez quelques secondes (l'API Gemini peut être lente)
   - La recette générée s'affichera avec un badge "IA"

## 🔍 Débogage

### Erreur : "Vous devez être connecté"

→ Vérifiez que vous êtes bien connecté. Le token JWT doit être présent dans `localStorage`

### Erreur : "Erreur lors de la génération"

→ Vérifiez :

- Le backend est bien lancé sur le port 8000
- La clé API Gemini est valide dans `.env`
- Les logs du backend pour plus de détails

### Le backend ne démarre pas

→ Vérifiez :

- MongoDB est accessible (testez l'URL de connexion)
- Toutes les dépendances sont installées
- Le fichier `.env` existe et est bien configuré

### Erreur CORS

→ Le backend est configuré pour accepter les requêtes de `http://localhost:3000`. Si vous utilisez un autre port, modifiez `backend/app/main.py` :

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:VOTRE_PORT"],  # Changez ici
    ...
)
```

## 📝 Structure de l'API

### POST `/recipes/generate`

**Headers:**

```
Authorization: Bearer <votre_token_jwt>
Content-Type: application/json
```

**Body:**

```json
["tomate", "poulet", "oignon"]
```

**Response (201 Created):**

```json
{
  "id": "...",
  "title": "Poulet aux tomates et oignons",
  "ingredients": ["tomate", "poulet", "oignon", ...],
  "instructions": ["Étape 1...", "Étape 2...", ...],
  "cooking_time": 30,
  "servings": 4,
  "user_id": "...",
  "is_ai_generated": true
}
```

## 🎯 Prochaines étapes (optionnelles)

- [ ] Ajouter un système de cache pour les recettes générées
- [ ] Permettre de regénérer une recette si l'utilisateur n'est pas satisfait
- [ ] Ajouter des filtres (cuisine, difficulté, temps) pour la génération
- [ ] Sauvegarder les recettes générées dans une collection séparée
- [ ] Ajouter des images générées par IA pour les recettes

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs du backend dans le terminal
2. Ouvrez la console du navigateur (F12) pour voir les erreurs frontend
3. Testez l'API directement via http://localhost:8000/docs (Swagger UI)
