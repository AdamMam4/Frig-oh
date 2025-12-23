# Frig-oh Backend API

Backend FastAPI pour l'application Frig-oh avec reconnaissance d'ingrédients par photo.

## Fonctionnalités

- 🔐 Authentification JWT
- 📝 Gestion des recettes
- 📸 **Reconnaissance d'ingrédients par photo (IA)**
- 🤖 **Génération automatique de recettes**
- 👤 Gestion des profils utilisateurs

## Installation

1. Créer un environnement virtuel :
```bash
python -m venv venv
```

2. Activer l'environnement virtuel :
- Windows PowerShell :
```powershell
.\venv\Scripts\Activate.ps1
```
- Windows CMD :
```cmd
.\venv\Scripts\activate.bat
```

3. Installer les dépendances :
```bash
pip install -r requirements.txt
```

4. Créer un fichier `.env` à partir de `.env.example` :
```bash
cp .env.example .env
```

5. Ajouter votre clé API Gemini dans `.env` :
```env
GEMINI_API_KEY=votre_clé_api_ici
```

## Lancement du serveur

```bash
python run.py
```

L'API sera accessible sur : http://localhost:8000

La documentation interactive (Swagger UI) sera disponible sur : http://localhost:8000/docs

## Fonctionnalités Photo/IA

Pour utiliser les fonctionnalités de reconnaissance d'ingrédients par photo et de génération de recettes, consultez la [documentation complète](./docs/PHOTO_FEATURES.md).

### Démarrage rapide :
```bash
# Tester avec le script démo
python scripts/example_photo_upload.py path/to/image.jpg
```

## Structure du projet

```
backend/
├── app/
│   ├── routes/          # Endpoints API
│   │   ├── auth.py      # Authentification
│   │   └── recipes.py   # Recettes + Photo AI
│   ├── services/        # Logique métier
│   │   ├── ai.py        # Service IA (Gemini)
│   │   ├── auth.py      # Service authentification
│   │   ├── recipe.py    # Service recettes
│   │   └── user.py      # Service utilisateurs
│   ├── database.py      # Configuration MongoDB
│   ├── models.py        # Modèles de données
│   └── main.py          # Point d'entrée FastAPI
├── docs/
│   └── PHOTO_FEATURES.md # Documentation photo/IA
├── scripts/
│   └── example_photo_upload.py # Script de démo
├── tests/
│   └── test_image_ingredients.py # Tests photo/IA
├── main.py              # Point d'entrée de l'application
├── run.py               # Script de lancement
├── requirements.txt     # Dépendances Python
└── README.md            # Ce fichier
```

## Tests

```bash
# Tous les tests
pytest

# Tests spécifiques aux fonctionnalités photo
pytest tests/test_image_ingredients.py -v
```

