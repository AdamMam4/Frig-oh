import google.generativeai as genai
from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

class AiService:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-pro')

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

        response = await self.model.generate_content(prompt)
        # Parse the response and convert to dictionary
        # Note: You might need to add error handling and response parsing logic
        recipe_dict = eval(response.text)  # Be careful with eval in production
        return recipe_dict