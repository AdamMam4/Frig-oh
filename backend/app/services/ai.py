import os
import json
import re
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

try:
    import google.generativeai as genai
except Exception:
    genai = None


def _strip_code_fences(text: str) -> str:
    # remove ```json ... ``` and ``` ... ``` fences
    return re.sub(r"```(?:json)?\s*(.*?)```", r"\1", text, flags=re.DOTALL)


class AiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        if genai is not None and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                model_name = os.getenv("GEMINI_MODEL", "models/gemini-2.0-flash")
                Model = getattr(genai, 'GenerativeModel', None)
                if Model is not None:
                    self.model = Model(model_name)
            except Exception:
                self.model = None

    async def generate_recipe(self, ingredients: List[str]) -> Dict:
        """
        Generate a recipe using Gemini if available, otherwise return a deterministic
        fallback recipe so the endpoint works for local development without keys.
        """
        def fallback(ings: List[str]) -> Dict:
            title = "Mix rapide de " + ", ".join(ings[:3])
            ingr_list = [i for i in ings]
            instructions = [
                f"Préparer les ingrédients: laver et couper {', '.join(ings[:2])}.",
                "Faire revenir dans une poêle avec un peu d'huile.",
                "Laisser mijoter jusqu'à cuisson complète.",
                "Rectifier l'assaisonnement et servir chaud."
            ]
            return {
                "title": title,
                "ingredients": ingr_list,
                "instructions": instructions,
                "cooking_time": 30,
                "servings": 2
            }

        if not self.model:
            return fallback(ingredients)

        prompt = f"Create a recipe using these ingredients: {', '.join(ingredients)}\nProvide the result as JSON with keys: title, ingredients (list), instructions (list), cooking_time (int), servings (int)."

        try:
            gen_fn = getattr(self.model, 'generate_content_async', None)
            if gen_fn is not None:
                resp = await gen_fn(prompt)
            else:
                resp = await self.model.generate_content(prompt)

            text = None
            if hasattr(resp, 'text'):
                try:
                    text = resp.text
                except Exception:
                    text = None
            if not text and hasattr(resp, 'parts'):
                try:
                    text = "\n".join(p.text for p in resp.parts if getattr(p, 'text', None))
                except Exception:
                    text = None

            if not text and isinstance(resp, str):
                text = resp

            if not text:
                return fallback(ingredients)

            cleaned = _strip_code_fences(text).strip()
            m = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
            json_text = m.group(0) if m else cleaned

            recipe = json.loads(json_text)
            if not all(k in recipe for k in ("title", "ingredients", "instructions", "cooking_time", "servings")):
                return fallback(ingredients)
            return recipe
        except Exception:
            return fallback(ingredients)
