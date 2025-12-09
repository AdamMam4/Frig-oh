"""
Example script demonstrating the photo-based ingredient recognition feature.

This script shows how to:
1. Upload an image of ingredients
2. Get the list of detected ingredients
3. Generate and save a recipe from the photo

Usage:
    python example_photo_upload.py /path/to/image.jpg
"""

import requests
import sys
import os
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000"
USERNAME = "testuser"  # Change to your username
PASSWORD = "password123"  # Change to your password

def login(username: str, password: str) -> str:
    """Login and get authentication token."""
    print(f"🔐 Logging in as {username}...")
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"username": username, "password": password}
    )
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("✅ Login successful!")
        return token
    else:
        print(f"❌ Login failed: {response.json()}")
        sys.exit(1)

def analyze_ingredients(image_path: str, token: str) -> dict:
    """
    Analyze an image and detect ingredients.
    
    Args:
        image_path: Path to the image file
        token: Authentication token
        
    Returns:
        Dictionary with detected ingredients
    """
    print(f"\n📸 Analyzing image: {image_path}")
    
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        sys.exit(1)
    
    with open(image_path, "rb") as f:
        files = {"file": (os.path.basename(image_path), f, "image/jpeg")}
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.post(
            f"{BASE_URL}/recipes/analyze-ingredients",
            files=files,
            headers=headers
        )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ {data['message']}")
        print(f"\n🥗 Detected Ingredients:")
        for i, ingredient in enumerate(data['ingredients'], 1):
            print(f"   {i}. {ingredient}")
        return data
    else:
        print(f"❌ Failed to analyze image: {response.json()}")
        sys.exit(1)

def generate_recipe_from_photo(image_path: str, token: str) -> dict:
    """
    Generate a complete recipe from a photo.
    
    Args:
        image_path: Path to the image file
        token: Authentication token
        
    Returns:
        Dictionary with detected ingredients and generated recipe
    """
    print(f"\n📸 Generating recipe from image: {image_path}")
    
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        sys.exit(1)
    
    with open(image_path, "rb") as f:
        files = {"file": (os.path.basename(image_path), f, "image/jpeg")}
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.post(
            f"{BASE_URL}/recipes/generate-from-photo",
            files=files,
            headers=headers
        )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ {data['message']}")
        
        print(f"\n🥗 Detected Ingredients:")
        for i, ingredient in enumerate(data['detected_ingredients'], 1):
            print(f"   {i}. {ingredient}")
        
        recipe = data['recipe']
        print(f"\n📖 Generated Recipe: {recipe['title']}")
        print(f"⏱️  Cooking Time: {recipe['cooking_time']} minutes")
        print(f"🍽️  Servings: {recipe['servings']}")
        
        print(f"\n📝 Ingredients List:")
        for i, ingredient in enumerate(recipe['ingredients'], 1):
            print(f"   {i}. {ingredient}")
        
        print(f"\n👨‍🍳 Instructions:")
        for i, instruction in enumerate(recipe['instructions'], 1):
            print(f"   {i}. {instruction}")
        
        return data
    else:
        print(f"❌ Failed to generate recipe: {response.json()}")
        sys.exit(1)

def main():
    """Main function."""
    print("=" * 60)
    print("🍳 Photo-Based Ingredient Recognition Demo")
    print("=" * 60)
    
    # Check if image path is provided
    if len(sys.argv) < 2:
        print("\n❌ Error: No image file provided")
        print("\nUsage:")
        print(f"  python {sys.argv[0]} <path_to_image.jpg>")
        print("\nExample:")
        print(f"  python {sys.argv[0]} ingredients.jpg")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Step 1: Login
    token = login(USERNAME, PASSWORD)
    
    # Step 2: Choose operation
    print("\n" + "=" * 60)
    print("Choose an option:")
    print("  1. Analyze ingredients only")
    print("  2. Generate complete recipe from photo")
    print("=" * 60)
    
    choice = input("\nEnter choice (1 or 2): ").strip()
    
    if choice == "1":
        # Just analyze ingredients
        result = analyze_ingredients(image_path, token)
        
    elif choice == "2":
        # Full workflow: analyze + generate + save
        result = generate_recipe_from_photo(image_path, token)
        
    else:
        print("❌ Invalid choice. Please enter 1 or 2.")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ Operation completed successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()
