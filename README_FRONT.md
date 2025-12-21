Front (React) — démarrage rapide

But: la partie frontend est une app Create React App (react-scripts). Voici comment démarrer localement (Windows PowerShell).

1) Prérequis
- Node.js (v18+ recommandé). Vérifier `node -v` et `npm -v`.
- Le backend (FastAPI) doit être démarré si vous voulez que les appels API fonctionnent (http://localhost:8000 par défaut).

2) Démarrage rapide (PowerShell)
- Depuis la racine du repo, exécute :

  .\scripts\start-front.ps1

Le script va :
- vérifier la présence de Node/npm
- définir `REACT_APP_API_BASE_URL` vers `http://localhost:8000` si non fournie
- exécuter `npm install` puis `npm start`

3) Options manuelles
- Installer deps et démarrer manuellement :

  cd C:\Users\yammi\Frig-oh
  npm install
  # Optionnel : définir l'URL du backend pour cette session PowerShell
  $env:REACT_APP_API_BASE_URL = 'http://localhost:8000'
  npm start

4) Notes
- L'URL du backend est configurable via la variable d'environnement `REACT_APP_API_BASE_URL`.
- Si vous voulez build pour prod : `npm run build`.

Si tu veux que je lance le front depuis ici (je vérifierai Node/npm), dis-le — sinon, lance ce script dans ton terminal local.
