from fastapi.testclient import TestClient
from types import SimpleNamespace
import app.routes.recipes as recipes_module
import app.database as database_module
from app.main import app


class FakeInsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FakeCollection:
    def __init__(self):
        self.storage = {}
        self._id_seq = 1

    async def insert_one(self, doc):
        _id = f"rid{self._id_seq}"
        self._id_seq += 1
        doc_copy = doc.copy()
        doc_copy["_id"] = _id
        self.storage[_id] = doc_copy
        return FakeInsertOneResult(inserted_id=_id)

    async def find_one(self, query):
        # simple exact match for _id or email
        if "_id" in query:
            return self.storage.get(query["_id"])
        # fallback: find by arbitrary key equality
        for doc in self.storage.values():
            ok = True
            for k, v in query.items():
                if doc.get(k) != v:
                    ok = False
                    break
            if ok:
                return doc
        return None

    def find(self, query):
        class Cursor:
            def __init__(self, docs):
                self._docs = docs

            async def to_list(self, length=None):
                return list(self._docs)

        results = []
        for doc in self.storage.values():
            matches = True
            for k, v in query.items():
                if doc.get(k) != v:
                    matches = False
                    break
            if matches:
                results.append(doc)
        return Cursor(results)

    async def update_one(self, filter_q, update_q):
        doc = await self.find_one(filter_q)
        if not doc:

            class R:
                modified_count = 0

            return R()
        # apply $set
        if "$set" in update_q:
            for k, v in update_q["$set"].items():
                doc[k] = v

        class R:
            modified_count = 1

        return R()

    async def delete_one(self, filter_q):
        doc = await self.find_one(filter_q)

        class R:
            def __init__(self, n):
                self.deleted_count = n

        if not doc:
            return R(0)
        # remove by _id
        for _id, d in list(self.storage.items()):
            if d == doc:
                del self.storage[_id]
                return R(1)
        return R(0)


def test_generate_and_save(monkeypatch):
    # Prepare fake DB collections
    fake_recipes = FakeCollection()
    fake_users = FakeCollection()

    # Put a fake user in users collection
    import asyncio

    async def create_user_doc():
        res = await fake_users.insert_one({"email": "u@test", "username": "u1"})
        return res.inserted_id

    user_id = asyncio.run(create_user_doc())

    # Override database collections
    monkeypatch.setattr(database_module, "recipes_collection", fake_recipes)
    monkeypatch.setattr(database_module, "users_collection", fake_users)

    # Override AI generation to return deterministic recipe
    async def fake_gen(ingredients):
        return {
            "title": "AI Stew",
            "ingredients": ingredients,
            "instructions": ["mix", "cook"],
            "cooking_time": 15,
            "servings": 3,
        }

    monkeypatch.setattr(recipes_module.ai_service, "generate_recipe", fake_gen)

    # Override auth dependency to return our fake user dict
    fake_user = {"_id": user_id, "email": "u@test", "username": "u1"}
    app.dependency_overrides[recipes_module.auth_service.get_current_user] = (
        lambda: fake_user
    )

    client = TestClient(app)

    # Call the generate endpoint
    r = client.post("/recipes/generate", json=["water", "salt"])
    assert r.status_code == 200
    data = r.json()
    assert data["title"] == "AI Stew"
    # ensure it was saved in fake_recipes storage and belongs to our user
    saved = list(fake_recipes.storage.values())
    assert len(saved) == 1
    assert saved[0]["user_id"] == user_id
