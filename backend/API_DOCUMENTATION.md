## API documentation — Backend (FastAPI)

This document describes the endpoints exposed by `backend/app/routes/recipes.py`. All routes require authentication (Bearer token via `AuthService.get_current_user`) unless otherwise noted.

Base URL examples: `http://localhost:8000/api/recipes` (adjust according to your deployment)

### Authentication
- Type: Bearer token (JWT)
- Header: `Authorization: Bearer <ACCESS_TOKEN>`

The user is resolved from the email stored in the JWT `sub` claim. If the token is invalid or the user is not found, the route returns 401.

---

## Endpoints

1) POST `/` — Create a recipe

- Description: Create a new recipe for the current user.
- Auth: required
- Body (JSON): schema `RecipeCreate` (see below)
- Response: the created recipe document (object, `_id` and `user_id` are strings)

Example body:

{
  "title": "Warm Salad",
  "ingredients": ["Tomatoes", "Carrots", "Onions"],
  "instructions": ["Chop the vegetables", "Mix and season"],
  "cooking_time": 15,
  "servings": 2
}

Status codes:
- 200/201: success
- 401: unauthorized

---

2) GET `/` — List the user's recipes

- Description: Returns the list of recipes that belong to the authenticated user.
- Auth: required
- Response: list of `Recipe` objects (Pydantic). Each item includes `_id`, `user_id`, `title`, `ingredients`, `instructions`, `cooking_time`, `servings`, `created_at`, `is_ai_generated`.

Status codes:
- 200: success
- 401: unauthorized

---

3) POST `/generate` — Generate a recipe via AI and save it

- Description: Calls the AI service (`AiService.generate_recipe`) to create a recipe from a list of ingredients, then saves the result for the user.
- Auth: required
- Parameters: `ingredients` — list of strings
  - IMPORTANT NOTE: As currently implemented, the signature `ingredients: List[str]` without `Body` means FastAPI expects `ingredients` as repeated query parameters. Example:

    POST /generate?ingredients=Tomatoes&ingredients=Carrots&ingredients=Onions

  - To accept JSON in the request body instead, change the route signature to `ingredients: List[str] = Body(...)`.

- Behavior:
  - The AI service should return a dictionary with at least: `title`, `ingredients`, `instructions`, `cooking_time`, `servings`.
  - The current code maps these fields into `RecipeCreate` and calls `recipe_service.create_recipe(..., is_ai_generated=True)`.

Saved response example (document returned after creation):

{
  "_id": "64a...",
  "title": "Rustic Beef Stew",
  "ingredients": ["Beef", "Tomatoes", "Carrots", "Onions", "Potatoes"],
  "instructions": ["Step 1...", "Step 2..."],
  "cooking_time": 90,
  "servings": 2,
  "user_id": "...",
  "is_ai_generated": true,
  "created_at": "..."
}

Status codes:
- 200/201: success
- 400/500: AI parsing or generation errors
- 401: unauthorized

Security notes & risks:
- The AI service should parse model responses safely. Avoid `eval(response.text)` and use `json.loads` after cleaning the text and validating the schema.
- AI generation can fail or return non-JSON text. Implement retries, timeouts, and robust error handling.

---

4) GET `/{recipe_id}` — Get a recipe

- Description: Retrieve a recipe by its identifier.
- Auth: required
- Access check: the API compares `recipe['user_id']` to `current_user['_id']`. If the current user is not the owner, the route returns 403.

Response example: same format as create (a `Recipe` object).

Status codes:
- 200: success
- 403: not authorized to view this recipe
- 401: unauthorized
- 404: recipe not found (not explicitly implemented — `recipe_service.get_recipe` may return `None`)

---

## Schemas (from `app.models`)

- RecipeCreate (request body for creation)
  - title: string (1-100)
  - ingredients: list[string]
  - instructions: list[string]
  - cooking_time: int (minutes, >0)
  - servings: int (>0)

- Recipe (response)
  - all fields from RecipeCreate +
  - _id: string
  - user_id: string
  - created_at: datetime (UTC)
  - is_ai_generated: bool

## Example calls

1) cURL — create a recipe:

```bash
curl -X POST "http://localhost:8000/api/recipes/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Warm Salad","ingredients":["Tomatoes","Carrots","Onions"],"instructions":["Chop","Mix"],"cooking_time":15,"servings":2}'
```

2) cURL — generate via AI (current query param usage):

```bash
curl -X POST "http://localhost:8000/api/recipes/generate?ingredients=Tomatoes&ingredients=Carrots&ingredients=Onions" \
  -H "Authorization: Bearer $TOKEN"
```

3) Fetch (JS) — get a recipe:

```js
fetch('http://localhost:8000/api/recipes/64a...', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log)
```

## Best practices & recommendations

- Replace any `eval` usage in `AiService.generate_recipe` with `json.loads` and validate the response with a Pydantic schema.
- Handle error cases: non-JSON responses, missing fields, AI API timeouts.
- For the `/generate` endpoint, prefer accepting a JSON body (`ingredients: List[str] = Body(...)`) to simplify clients.
- Add unit/integration tests for: create, read, AI generation (mocked), and access control (403).

## Useful commands for local testing

Run the server (uvicorn example):

```powershell
# from the backend folder
uvicorn app.main:app --reload --port 8000
```

Adjust port/base path as needed.

---

This file was auto-generated for branch `feature/ai-testing`. If you want, I can:
- convert this documentation into a Swagger/Redoc page,
- change the `/generate` endpoint to accept a JSON body,
- fix AI parsing in `AiService` and add tests.
