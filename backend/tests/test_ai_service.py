import asyncio
from types import SimpleNamespace

from app.services.ai import AiService


def test_ai_generate_monkeypatch(monkeypatch):
    ai = AiService()

    async def fake_generate_content(prompt):
        # Return a simple text that evals to a dict (matches implementation)
        return SimpleNamespace(text="{"
                                 "'title':'AI Soup',"
                                 "'ingredients':['water','salt'],"
                                 "'instructions':['boil water','add salt'],"
                                 "'cooking_time':10,"
                                 "'servings':2}" )

    # Replace the async generate_content on the model
    monkeypatch.setattr(ai.model, "generate_content", fake_generate_content)

    recipe = asyncio.run(ai.generate_recipe(["water", "salt"]))

    assert isinstance(recipe, dict)
    assert recipe["title"] == "AI Soup"
    assert recipe["cooking_time"] == 10
