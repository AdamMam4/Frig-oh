import google.generativeai as genai
from typing import List, Dict
import os
import json
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()

class AiService:
    """Service for AI-powered recipe and ingredient analysis using Google Gemini."""
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        genai.configure(api_key=api_key)
        # Using Gemini 1.5 Flash: stable, free tier available, supports both text and vision
        # Both text and vision use the same model for consistency and stability
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def analyze_ingredients_from_image(self, image_data: bytes) -> List[str]:
        """
        Analyze an image and extract ingredients using Google's Gemini Vision API.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            List of ingredient names detected in the image
            
        Raises:
            Exception: If image analysis fails
        """
        try:
            image = Image.open(io.BytesIO(image_data))
            
            prompt = """Analyze this image and identify all food ingredients visible.
            Return ONLY a JSON array of ingredient names, nothing else.
            Be specific (e.g., "cherry tomatoes" instead of just "tomatoes").
            Example format: ["tomatoes", "eggs", "onions", "garlic"]
            
            Only include actual food ingredients, not prepared dishes or cookware."""
            
            response = self.model.generate_content([prompt, image])
            text = response.text.strip()
            
            # Remove markdown code blocks if present
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()
            elif text.startswith("```"):
                text = text.replace("```", "").strip()
            
            ingredients = json.loads(text)
            
            if not isinstance(ingredients, list):
                raise ValueError("AI response is not a list")
                
            return ingredients
            
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse AI response: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to analyze image: {str(e)}")

    async def generate_recipe(self, ingredients: List[str]) -> Dict:
        """
        Generate a recipe using the provided ingredients.
        
        Args:
            ingredients: List of ingredient names
            
        Returns:
            Dictionary containing recipe details (title, ingredients, instructions, etc.)
            
        Raises:
            Exception: If recipe generation fails
        """
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

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            # Remove markdown code blocks if present
            if text.startswith("```json"):
                text = text.replace("```json", "").replace("```", "").strip()
            elif text.startswith("```"):
                text = text.replace("```", "").strip()
                
            recipe_dict = json.loads(text)
            return recipe_dict
            
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse recipe response: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to generate recipe: {str(e)}")