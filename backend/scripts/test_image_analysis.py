#!/usr/bin/env python3
"""Test script to analyze ingredients from an image using Gemini AI."""
import sys
import os
import asyncio

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.ai import AiService


async def main():
    # Get image path from command line or use default
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        image_path = os.path.join(os.path.dirname(__file__), '..', 'ingredients.jpg')
    
    # Check if file exists
    if not os.path.exists(image_path):
        print(f"❌ Error: Image file not found: {image_path}")
        print(f"Usage: python {os.path.basename(__file__)} [path/to/image.jpg]")
        return 1
    
    print(f"📸 Analyzing image: {image_path}")
    print(f"📏 File size: {os.path.getsize(image_path) / 1024:.2f} KB")
    print("-" * 60)
    
    # Initialize AI service
    ai_service = AiService()
    
    if not ai_service.model:
        print("❌ Error: Gemini AI not available. Check your GEMINI_API_KEY.")
        return 1
    
    # Read image file
    with open(image_path, 'rb') as f:
        image_data = f.read()
    
    # Analyze ingredients
    try:
        print("🔍 Analyzing ingredients with Gemini AI...")
        ingredients = await ai_service.analyze_ingredients_from_image(image_data)
        
        print("✅ Analysis complete!")
        print("-" * 60)
        print(f"🥗 Detected {len(ingredients)} ingredient(s):")
        for i, ingredient in enumerate(ingredients, 1):
            print(f"  {i}. {ingredient}")
        print("-" * 60)
        
        return 0
        
    except Exception as e:
        print(f"❌ Error analyzing image: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
