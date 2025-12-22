## Documentation de l'API — Backend (FastAPI)

Cette documentation décrit les endpoints exposés par `backend/app/routes/recipes.py`. Toutes les routes nécessitent une authentification (token Bearer) via la dépendance `AuthService.get_current_user` sauf indication contraire.

Base URL (exemples): `http://localhost:8000/api/recipes` (adapter selon la configuration de l'application)

### Authentification
- Type : Bearer token (JWT)
- En-tête : `Authorization: Bearer <ACCESS_TOKEN>`

L'utilisateur est récupéré via l'email encodé dans le 'sub' du JWT. Si le token est invalide ou l'utilisateur introuvable, la route renverra 401.

---

## Endpoints

1) POST `/` — Créer une recette

- Description : Crée une nouvelle recette pour l'utilisateur courant.
- Auth : requis
- Body (JSON) — schéma `RecipeCreate` (voir ci-dessous)
- Réponse : Document de la recette créée (objet, avec `_id` et `user_id` en string)

Exemple de body:

{
  "title": "Salade tiède",
  "ingredients": ["Tomates", "Carottes", "Oignons"],
  "instructions": ["Couper les légumes", "Mélanger et assaisonner"],
  "cooking_time": 15,
  "servings": 2
}

Codes de statut:
- 200/201 : succès
- 401 : non authentifié

---

2) GET `/` — Lister les recettes de l'utilisateur

- Description : Retourne la liste des recettes appartenant à l'utilisateur authentifié.
- Auth : requis
- Réponse : liste d'objets `Recipe` (format pydantic), chaque item contient `_id`, `user_id`, `title`, `ingredients`, `instructions`, `cooking_time`, `servings`, `created_at`, `is_ai_generated`.

Codes de statut:
- 200 : succès
- 401 : non authentifié

---

3) POST `/generate` — Générer une recette via l'IA puis l'enregistrer

- Description : Envoie une requête au service AI (`AiService.generate_recipe`) pour créer une recette à partir d'une liste d'ingrédients, puis enregistre le résultat pour l'utilisateur.
- Auth : requis
- Paramètres : `ingredients` — liste de chaînes
  - REMARQUE IMPORTANT : tel que codé actuellement, la signature `ingredients: List[str]` sans Body indique que FastAPI attend les `ingredients` comme paramètres de requête répétables.
    Exemple d'appel (query params) :

    POST /generate?ingredients=Tomates&ingredients=Carottes&ingredients=Oignons

  - Si vous préférez envoyer en JSON dans le corps, il faut modifier la route pour utiliser `ingredients: List[str] = Body(...)`.

- Comportement :
  - Le service AI retourne un dictionnaire contenant au minimum : `title`, `ingredients`, `instructions`, `cooking_time`, `servings`.
  - Le code actuel utilise ces champs pour construire un `RecipeCreate` et appelle `recipe_service.create_recipe(..., is_ai_generated=True)`.

Exemple de réponse sauvegardée (document retourné après création) :

{
  "_id": "64a...",
  "title": "Ragoût de boeuf rustique",
  "ingredients": ["Boeuf", "Tomates", "Carottes", "Oignons", "Pommes de terre"],
  "instructions": ["Étape 1...", "Étape 2..."],
  "cooking_time": 90,
  "servings": 2,
  "user_id": "...",
  "is_ai_generated": true,
  "created_at": "..."
}

Codes de statut:
- 200/201 : succès
- 400/500 : erreurs côté IA ou parsing
- 401 : non authentifié

Notes et risques de sécurité :
- Le service AI (`app.services.ai.AiService`) utilise actuellement `eval(response.text)` pour parser la réponse JSON — ceci est dangereux en production. Il faut remplacer `eval` par `json.loads` après s'assurer que `response.text` contient bien du JSON. Ajoutez une validation stricte et un timeout.
- La génération peut échouer ou retourner du texte non-JSON ; prévoir un traitement d'erreur et des retries/fallback.

---

4) GET `/{recipe_id}` — Récupérer une recette

- Description : Récupère une recette par son identifiant.
- Auth : requis
- Vérification d'accès : l'API compare `recipe['user_id']` au `current_user['_id']`. Si l'utilisateur courant n'est pas le propriétaire, la route renvoie 403.

Exemple de réponse : même format que la création (objet `Recipe`).

Codes de statut:
- 200 : succès
- 403 : l'utilisateur n'est pas autorisé à voir cette recette
- 401 : non authentifié
- 404 : recette introuvable (pas implémenté explicitement — `recipe_service.get_recipe` peut renvoyer `None`)

---

## Schémas (d'après `app.models`)

- RecipeCreate (corps attendu pour création)
  - title: string (1-100)
  - ingredients: list[string]
  - instructions: list[string]
  - cooking_time: int (minutes, >0)
  - servings: int (>0)

- Recipe (réponse)
  - les champs de RecipeCreate +
  - _id: string
  - user_id: string
  - created_at: datetime (UTC)
  - is_ai_generated: bool

## Exemples d'appels

1) cURL — créer une recette :

```bash
curl -X POST "http://localhost:8000/api/recipes/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Salade tiède","ingredients":["Tomates","Carottes","Oignons"],"instructions":["Couper","Mélanger"],"cooking_time":15,"servings":2}'
```

2) cURL — générer via IA (query params actuels) :

```bash
curl -X POST "http://localhost:8000/api/recipes/generate?ingredients=Tomates&ingredients=Carottes&ingredients=Oignons" \
  -H "Authorization: Bearer $TOKEN"
```

3) Fetch (JS) — récupérer une recette :

```js
fetch('http://localhost:8000/api/recipes/64a...', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log)
```

## Bonnes pratiques et recommandations

- Remplacer `eval` dans `AiService.generate_recipe` par `json.loads` et ajouter un schéma de validation (pydantic) pour la réponse de l'IA.
- Gérer les cas d'erreur détaillés : réponses non-JSON, champs manquants, timeouts de l'API IA.
- Pour l'endpoint `/generate`, préférer accepter un body JSON (modifier la signature pour `ingredients: List[str] = Body(...)`) afin de simplifier les clients.
- Ajouter des tests unitaires/integration pour : création, lecture, génération IA (mock), contrôles d'accès (403).

## Commandes utiles pour tester localement

Lancer le serveur (exemple uvicorn) :

```powershell
# depuis le dossier backend
uvicorn app.main:app --reload --port 8000
```

Remplacer le port/base path selon la configuration du projet.

---

Fichier généré automatiquement pour la branche `feature/ai-testing`. Si tu veux, je peux :
- convertir cette documentation en une page Swagger/Redoc customisée,
- modifier l'endpoint `/generate` pour accepter un body JSON,
- corriger le parsing `eval` dans `AiService` et ajouter des tests.
