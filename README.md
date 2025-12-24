# Frig-oh

Frig-oh is a web application (React frontend + FastAPI backend) for managing and generating recipes, detecting ingredients from photos, and delivering visual experiences (3D models and an intro video).

This README provides a concise, English-only overview of the project, the technologies used, how to run it, and where to look in the codebase.

## Technologies

- Backend: Python 3.x, FastAPI, Uvicorn, Pydantic, Motor (async Mongo client) / PyMongo, pytest
- AI: Google Gemini (gemini model), Pillow for image handling; safe JSON parsing and fallback templates
- Frontend: React (v18+/v19), TypeScript, Tailwind CSS, Framer Motion, Three.js, Radix UI, lucide-react
- Dev & tooling: Docker / Docker Compose, Node/npm, ESLint, Prettier, TypeScript, CI-friendly test tooling

## Key structure (entry points)

- `backend/`
  - `app/main.py`, `run.py` — FastAPI startup
  - `app/routes/` — API endpoints (auth, recipes, image upload)
  - `app/services/ai.py` — Gemini integration and secure parsing
  - `app/services/recipe.py` — recipe business logic
  - `app/database.py`, `app/models.py` — MongoDB and Pydantic models
  - `tests/` — pytest test suite (image/AI and recipes)
- `src/` (frontend)
  - `index.tsx`, `App.tsx` — React entry
  - `components/` — pages and components (RecipesPage, RecipeDetail, RecipeCard, SaladThree, IntroVideo, etc.)
  - `data/` — sample recipes and ingredients
  - `styles/globals.css` — Tailwind and custom CSS
  - `services/api.ts` — API wrapper for backend calls
- `package.json` — frontend dependencies (React, three, framer-motion, tailwind, radix, lucide)
- `backend/requirements.txt` — Python dependencies

## Features (brief)

- Backend
  - JWT authentication, recipe CRUD, favorites, user profiles
  - Image upload -> AI ingredient detection
  - Recipe generation via AI with local fallback
  - Pytest tests for key flows

- Frontend
  - Recipe listing, search, filtering
  - Recipe detail modal (`RecipeDetail`)
  - Favorites synced with backend
  - Utility components (ImageWithFallback, ThemeProvider)

- Animations / Graphics
  - `SaladThree.tsx`: three.js — loads a GLB model, recenters/scales it, auto-rotates, drag-to-rotate with easing, and performs proper cleanup
  - `IntroVideo.tsx`: full-screen intro video with fallback handling and a skip button
  - UI transitions use Framer Motion and Tailwind animations

## Linters & Formatters

This project uses ESLint and Prettier for static analysis and automated formatting.

- ESLint
  - Core packages present: `eslint`, `@eslint/js` and plugins such as `eslint-plugin-react`, `eslint-plugin-import`.
  - Configuration: the project extends Create React App defaults (`react-app`, `react-app/jest`) via `package.json`.
  - Purpose: catch likely bugs, enforce best practices and maintain code quality for JS/TS files.

- Prettier
  - Package: `prettier` with `eslint-plugin-prettier` and `eslint-config-prettier` to avoid rule conflicts.
  - Purpose: automatic, consistent code formatting (spacing, quotes, trailing commas, etc.).

- TypeScript linting
  - The repo lists a `typescript-eslint` entry in devDependencies; the canonical ESLint TypeScript packages are `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` if you enable TypeScript-specific rules.

Scripts (see `package.json`)

```bash
npm run lint       # runs: eslint .
npm run lint:fix   # runs: eslint . --fix
npm run format     # runs: prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,md}"
npm run check      # runs lint + format
```

How to run (project root):

```powershell
npm install
npm run lint
npm run lint:fix
npm run format
```

Editor integration

For the best developer experience enable ESLint and Prettier extensions in your editor and enable format-on-save.

Note: there are no pre-commit hooks configured in this repo by default.

## Important environment variables

- Backend (`backend/.env` created from `.env.example`):
  - `MONGO_URI` — MongoDB connection string
  - `SECRET_KEY` — JWT secret
  - `GEMINI_API_KEY` — Google Gemini API key (optional; the code has a fallback)

> Do not commit secrets to the repository.

## Quick start

With Docker (recommended if available):

```powershell
docker-compose up --build
```

Backend (local, without Docker):

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# copy .env.example -> .env and fill GEMINI_API_KEY and MONGO_URI
python run.py
```

Frontend (local):

```powershell
npm install
npm start
# open http://localhost:3000
```

## Tests

Backend:

```powershell
cd backend
pytest -v
```

Frontend:

```powershell
npm test
```

## Technical notes and attention points

- `backend/app/services/ai.py` strips code fences and parses JSON safely (no eval). A fallback exists when Gemini is unavailable.
- `SaladThree.tsx` properly disposes geometries and materials on unmount to avoid memory leaks.
- Some UI text and labels remain in French; standardize language on a dedicated branch with atomic commits.
- Install frontend dependencies before running `npm start` to avoid type/module errors.

## Recommended first files to read

1. `backend/app/services/ai.py` — AI pipeline (image -> ingredients, recipe generation)
2. `backend/app/routes/recipes.py` — API endpoints used by the frontend
3. `src/components/RecipesPage.tsx` and `src/components/RecipeDetail.tsx` — main UI flow

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
