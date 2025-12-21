# 🔐 Configuration sécurisée du Backend

## Configuration de l'environnement

### 1. Copier le fichier d'exemple

```bash
cp .env.example .env
```

### 2. Configurer MongoDB

**Option A : MongoDB Local**

```env
MONGODB_URL=mongodb://localhost:27017/
DATABASE_NAME=frigoh
```

**Option B : MongoDB Atlas (Recommandé)**

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Créez un utilisateur de base de données
4. Obtenez votre chaîne de connexion
5. Configurez dans `.env` :

```env
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
DATABASE_NAME=frigoh
```

### 3. Générer une clé JWT sécurisée

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copiez le résultat dans `.env` :

```env
SECRET_KEY=<votre_clé_générée>
```

### 4. Configurer Gemini AI

1. Obtenez une clé API sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Ajoutez-la dans `.env` :

```env
GEMINI_API_KEY=<votre_clé_api>
```

## ⚠️ Sécurité

### ❌ Ne JAMAIS faire :

- Committer le fichier `.env`
- Partager vos clés API
- Coder des secrets en dur dans le code
- Utiliser les mêmes clés en dev et production

### ✅ Toujours faire :

- Garder `.env` dans `.gitignore`
- Utiliser des variables d'environnement
- Régénérer les clés si elles sont exposées
- Utiliser des clés différentes par environnement

## 🚀 Démarrage

Une fois `.env` configuré :

```bash
# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
python run.py
```

L'API sera disponible sur `http://localhost:8000`

Documentation interactive : `http://localhost:8000/docs`

## 📚 API Endpoints

### Authentification

- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter

### Recettes (authentification requise)

- `POST /recipes/` - Créer une recette
- `GET /recipes/` - Lister mes recettes
- `POST /recipes/generate` - Générer avec IA
- `GET /recipes/{id}` - Récupérer une recette

## 🔒 Variables d'environnement requises

| Variable                      | Description               | Exemple                      |
| ----------------------------- | ------------------------- | ---------------------------- |
| `MONGODB_URL`                 | URL de connexion MongoDB  | `mongodb://localhost:27017/` |
| `DATABASE_NAME`               | Nom de la base de données | `frigoh`                     |
| `SECRET_KEY`                  | Clé secrète JWT           | Généré avec secrets          |
| `ALGORITHM`                   | Algorithme JWT            | `HS256`                      |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Durée du token            | `30`                         |
| `GEMINI_API_KEY`              | Clé API Gemini            | De Google AI Studio          |

## 🧪 Tests

```bash
# Test de connexion MongoDB (une fois configuré)
python -c "from app.database import client; print('OK' if client.server_info() else 'FAIL')"
```

## 📝 Aide

Pour toute question de configuration ou de sécurité, consultez `SECURITY_REPORT.md` à la racine du projet.
