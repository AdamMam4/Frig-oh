# Frig-oh Backend API

Backend FastAPI pour l'application Frig-oh.

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

## Lancement du serveur

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

L'API sera accessible sur : http://localhost:8000

La documentation interactive (Swagger UI) sera disponible sur : http://localhost:8000/docs

## Structure du projet

```
backend/
├── main.py              # Point d'entrée de l'application
├── requirements.txt     # Dépendances Python
├── .env.example        # Exemple de configuration
├── .gitignore          # Fichiers à ignorer par Git
└── README.md           # Ce fichier
```
