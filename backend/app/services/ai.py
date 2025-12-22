import os
import json
import re
from typing import List, Dict
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()

try:
    import google.generativeai as genai
except Exception:
    genai = None


def _strip_code_fences(text: str) -> str:
    # remove ```json ... ``` and ``` ... ``` fences
    return re.sub(r"```(?:json)?\s*(.*?)```", r"\1", text, flags=re.DOTALL)


class AiService:
    """Service for AI-powered recipe and ingredient analysis using Google Gemini."""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        if genai is not None and self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                # Using gemini-2.5-flash - confirmed available from list_models()
                # Supports generateContent which we need for image analysis
                self.model = genai.GenerativeModel("models/gemini-2.5-flash")
            except Exception as e:
                self.model = None

    async def analyze_ingredients_from_image(self, image_data: bytes) -> List[str]:
        """
        Analyze an image and extract ingredients using Google's Gemini Vision API.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            List of ingredient names detected in the image
            
        Raises:
            Exception: If image analysis fails or Gemini is not available
        """
        if not self.model:
            raise Exception("Gemini AI not available. Please configure GEMINI_API_KEY.")
        
        try:
            image = Image.open(io.BytesIO(image_data))
            
            prompt = """Analyse cette image et identifie tous les ingrédients alimentaires visibles.
            Retourne UNIQUEMENT un tableau JSON des noms d'ingrédients EN FRANÇAIS, rien d'autre.
            Sois précis (par exemple, "tomates cerises" au lieu de simplement "tomates").
            Format d'exemple: ["tomates", "œufs", "oignons", "ail"]
            
            Inclus uniquement les ingrédients alimentaires réels, pas les plats préparés ou les ustensiles de cuisine."""
            
            gen_fn = getattr(self.model, 'generate_content_async', None)
            if gen_fn is not None:
                response = await gen_fn([prompt, image])
            else:
                response = await self.model.generate_content([prompt, image])
            
            text = None
            if hasattr(response, 'text'):
                try:
                    text = response.text
                except Exception:
                    text = None
            
            if not text:
                raise Exception("No text response from Gemini")
            
            cleaned = _strip_code_fences(text).strip()
            
            # Try to extract JSON array
            m = re.search(r"\[.*\]", cleaned, flags=re.DOTALL)
            json_text = m.group(0) if m else cleaned
            
            ingredients = json.loads(json_text)
            
            if not isinstance(ingredients, list):
                raise ValueError("AI response is not a list")
                
            return ingredients
            
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse AI response: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to analyze image: {str(e)}")

    async def generate_recipe(self, ingredients: List[str]) -> Dict:
        """
        Generate a recipe using Gemini if available, otherwise return a deterministic
        fallback recipe so the endpoint works for local development without keys.
        """
        def fallback(ings: List[str]) -> Dict:
            # Templates de recettes variés selon les ingrédients
            templates = {
                'poulet': {
                    'title': 'Poulet rôti aux herbes',
                    'base_instructions': [
                        "Préchauffer le four à 180°C.",
                        "Assaisonner le poulet avec sel, poivre et herbes.",
                        "Ajouter {} autour du poulet.",
                        "Enfourner 45-60 minutes en arrosant régulièrement.",
                        "Vérifier la cuisson et laisser reposer 10 minutes avant de servir."
                    ],
                    'time': 60,
                    'servings': 4
                },
                'poisson': {
                    'title': 'Poisson en papillote',
                    'base_instructions': [
                        "Préparer du papier sulfurisé ou aluminium.",
                        "Disposer le poisson au centre avec {}.",
                        "Fermer hermétiquement la papillote.",
                        "Cuire au four à 200°C pendant 15-20 minutes.",
                        "Servir aussitôt avec le jus de cuisson."
                    ],
                    'time': 25,
                    'servings': 2
                },
                'pâtes': {
                    'title': 'Pâtes crémeuses',
                    'base_instructions': [
                        "Cuire les pâtes dans l'eau bouillante salée selon les instructions.",
                        "Pendant ce temps, faire revenir {} dans une poêle.",
                        "Ajouter de la crème fraîche et laisser réduire.",
                        "Égoutter les pâtes et les mélanger à la sauce.",
                        "Servir chaud avec du parmesan râpé."
                    ],
                    'time': 20,
                    'servings': 3
                },
                'default': {
                    'title': f"Plat maison aux {ings[0] if ings else 'légumes'}",
                    'base_instructions': [
                        f"Préparer et laver tous les ingrédients: {', '.join(ings[:3])}.",
                        "Faire chauffer un filet d'huile d'olive dans une poêle ou casserole.",
                        "Faire revenir les ingrédients 5-7 minutes en remuant.",
                        "Assaisonner avec sel, poivre et épices au choix.",
                        "Laisser mijoter 15-20 minutes à feu doux.",
                        "Rectifier l'assaisonnement et servir chaud."
                    ],
                    'time': 30,
                    'servings': 2
                }
            }
            
            # Détection du type de recette
            ings_lower = [i.lower() for i in ings]
            template = templates['default']
            
            for key in ['poulet', 'poisson', 'pâtes', 'pasta', 'spaghetti']:
                if any(key in ing for ing in ings_lower):
                    if key in templates:
                        template = templates[key]
                    elif key in ['pasta', 'spaghetti']:
                        template = templates['pâtes']
                    break
            
            # Construire les instructions avec les ingrédients
            other_ings = [i for i in ings[1:] if i.lower() not in template['title'].lower()]
            ing_text = ', '.join(other_ings[:3]) if other_ings else 'les autres ingrédients'
            
            instructions = [
                instr.format(ing_text) if '{}' in instr else instr 
                for instr in template['base_instructions']
            ]
            
            return {
                "title": template['title'],
                "ingredients": ings,
                "instructions": instructions,
                "cooking_time": template['time'],
                "servings": template['servings']
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
        except Exception as e:
            return fallback(ingredients)
