# 🔐 Backend secure configuration

## Environment setup

### 1. Copy the example file

```bash
cp .env.example .env
```

### 2. Configure MongoDB

**Option A: Local MongoDB**

```env
MONGODB_URL=mongodb://localhost:27017/
DATABASE_NAME=frigoh
```

**Option B: MongoDB Atlas (recommended)**

1. Create an account on MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Put it in `.env` like:

```env
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
DATABASE_NAME=frigoh
```

### 3. Generate a secure JWT secret

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output into `.env`:

```env
SECRET_KEY=<your_generated_key>
```

### 4. Configure Gemini AI

1. Obtain an API key from Google AI Studio: https://makersuite.google.com/app/apikey
2. Put it in `.env`:

```env
GEMINI_API_KEY=<your_api_key>
```

## ⚠️ Security

### ❌ Never do:

- Commit the `.env` file
- Share your API keys
- Hard-code secrets in source code
- Reuse the same keys for dev and production

### ✅ Best practices:

- Keep `.env` in `.gitignore`
- Use environment variables for secrets
- Rotate keys if they are exposed
- Use separate keys per environment

## 🚀 Run locally

Once `.env` is configured:

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python run.py
```

The API will be available at `http://localhost:8000`.

Interactive docs: `http://localhost:8000/docs`

## 📚 API Endpoints

### Authentication

- `POST /auth/register` - Create an account
- `POST /auth/login` - Login

### Recipes (authentication required)

- `POST /recipes/` - Create a recipe
- `GET /recipes/` - List my recipes
- `POST /recipes/generate` - Generate a recipe with AI
- `GET /recipes/{id}` - Get a recipe

## 🔒 Required environment variables

| Variable | Description | Example |
| -------- | ----------- | ------- |
| `MONGODB_URL` | MongoDB connection URL | `mongodb://localhost:27017/` |
| `DATABASE_NAME` | Database name | `frigoh` |
| `SECRET_KEY` | JWT secret | Generated with `secrets` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime (minutes) | `30` |
| `GEMINI_API_KEY` | Gemini API key | From Google AI Studio |

## 🧪 Tests

```bash
# Test MongoDB connection (after setup)
python -c "from app.database import client; print('OK' if client.server_info() else 'FAIL')"
```

## 📝 Help

For configuration or security questions see `SECURITY_REPORT.md` at the project root.
