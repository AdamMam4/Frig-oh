import google.generativeai as genai
from typing import List, Dict
import os
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()

class AiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        genai.configure(api_key=api_key)
        # Using latest Gemini 2.5 Flash model (supports both text and vision)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.vision_model = genai.GenerativeModel('gemini-2.5-flash')

    async def analyze_ingredients_from_image(self, image_data: bytes) -> List[str]:
        """
        Analyze an image and extract ingredients using Google's Gemini Vision API.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            List of ingredient names detected in the image
        """
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            prompt = """Analyze this image and identify all food ingredients visible.
            Return ONLY a JSON array of ingredient names, nothing else.
            Be specific (e.g., "cherry tomatoes" instead of just "tomatoes").
            Example format: ["tomatoes", "eggs", "onions", "garlic"]
            
            Only include actual food ingredients, not prepared dishes or cookware."""
            
            response = self.vision_model.generate_content([prompt, image])
            
            # Parse the response to extract ingredient list
            import json
            text = response.text.strip()
            
            # Remove markdown code blocks if present
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()
            elif text.startswith("```"):
                text = text.replace("```", "").strip()
            
            ingredients = json.loads(text)
            
            if not isinstance(ingredients, list):
                raise ValueError("Response is not a list")
                
            return ingredients
            
        except Exception as e:
            print(f"Error analyzing image: {str(e)}")
            raise Exception(f"Failed to analyze image: {str(e)}")

    async def generate_recipe(self, ingredients: List[str]) -> Dict:
        prompt = f"""Create a recipe using these ingredients: {', '.join(ingredients)}
        Please provide the response in the following JSON format:
        {{
            "title": "Recipe Name",
            "ingredients": ["ingredient 1", "ingredient 2", ...],
            "instructions": ["step 1", "step 2", ...],
            "cooking_time": time_in_minutes,
            "servings": number_of_servings
        }}
        Make sure the recipe is practical and detailed."""

        response = self.model.generate_content(prompt)
        # Parse the response and convert to dictionary
        import json
        text = response.text.strip()
        
        # Remove markdown code blocks if present
        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()
        elif text.startswith("```"):
            text = text.replace("```", "").strip()
            
        recipe_dict = json.loads(text)
        return recipe_dict