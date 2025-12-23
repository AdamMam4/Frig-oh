"""
Tests for image-based ingredient recognition feature.

This module contains test cases for the photo upload and ingredient
detection endpoints. Tests require authentication tokens.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
import io
from PIL import Image

client = TestClient(app)

def create_test_image(width: int = 100, height: int = 100, color: str = 'red') -> io.BytesIO:
    """
    Create a simple test image in memory.
    
    Args:
        width: Image width in pixels
        height: Image height in pixels
        color: Background color
        
    Returns:
        BytesIO object containing JPEG image data
    """
    img = Image.new('RGB', (width, height), color=color)
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_analyze_ingredients_endpoint():
    """
    Test the /recipes/analyze-ingredients endpoint.
    
    Note: This test requires a valid authentication token.
    Replace 'YOUR_TEST_TOKEN_HERE' with an actual token for testing.
    """
    test_image = create_test_image()
    
    headers = {"Authorization": "Bearer YOUR_TEST_TOKEN_HERE"}
    files = {"file": ("test_image.jpg", test_image, "image/jpeg")}
    
    response = client.post(
        "/recipes/analyze-ingredients",
        files=files,
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "ingredients" in data
    assert "count" in data
    assert "message" in data
    assert isinstance(data["ingredients"], list)
    assert data["count"] == len(data["ingredients"])

def test_generate_recipe_from_photo():
    """
    Test the /recipes/generate-from-photo endpoint.
    
    This endpoint should:
    1. Analyze the image for ingredients
    2. Generate a recipe using AI
    3. Save the recipe to the database
    """
    test_image = create_test_image()
    
    headers = {"Authorization": "Bearer YOUR_TEST_TOKEN_HERE"}
    files = {"file": ("test_image.jpg", test_image, "image/jpeg")}
    
    response = client.post(
        "/recipes/generate-from-photo",
        files=files,
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "detected_ingredients" in data
    assert "recipe" in data
    assert "message" in data
    assert isinstance(data["detected_ingredients"], list)
    assert "title" in data["recipe"]

def test_invalid_file_type():
    """Test that non-image files are rejected with appropriate error."""
    text_file = io.BytesIO(b"This is not an image")
    
    headers = {"Authorization": "Bearer YOUR_TEST_TOKEN_HERE"}
    files = {"file": ("test.txt", text_file, "text/plain")}
    
    response = client.post(
        "/recipes/analyze-ingredients",
        files=files,
        headers=headers
    )
    
    assert response.status_code == 400
    assert "must be an image" in response.json()["detail"].lower()

def test_missing_authentication():
    """Test that unauthenticated requests are rejected."""
    test_image = create_test_image()
    files = {"file": ("test_image.jpg", test_image, "image/jpeg")}
    
    response = client.post(
        "/recipes/analyze-ingredients",
        files=files
    )
    
    assert response.status_code == 401

if __name__ == "__main__":
    pytest.main([__file__, "-v"])

