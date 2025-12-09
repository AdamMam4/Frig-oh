"""
Test file for image-based ingredient recognition feature.

This file demonstrates how to test the photo upload and ingredient
detection endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
import io
from PIL import Image

client = TestClient(app)

def create_test_image():
    """Create a simple test image in memory."""
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes

def test_analyze_ingredients_endpoint():
    """
    Test the /recipes/analyze-ingredients endpoint.
    
    Note: This test requires authentication. You'll need to:
    1. Create a test user
    2. Get an authentication token
    3. Include it in the request headers
    """
    # Create a test image
    test_image = create_test_image()
    
    # Mock authentication token (replace with actual token in real tests)
    headers = {
        "Authorization": "Bearer YOUR_TEST_TOKEN_HERE"
    }
    
    # Send POST request with image file
    files = {
        "file": ("test_image.jpg", test_image, "image/jpeg")
    }
    
    response = client.post(
        "/recipes/analyze-ingredients",
        files=files,
        headers=headers
    )
    
    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert "ingredients" in data
    assert "count" in data
    assert isinstance(data["ingredients"], list)

def test_generate_recipe_from_photo():
    """
    Test the /recipes/generate-from-photo endpoint.
    
    This endpoint should:
    1. Analyze the image for ingredients
    2. Generate a recipe
    3. Save it to the database
    """
    test_image = create_test_image()
    
    headers = {
        "Authorization": "Bearer YOUR_TEST_TOKEN_HERE"
    }
    
    files = {
        "file": ("test_image.jpg", test_image, "image/jpeg")
    }
    
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

def test_invalid_file_type():
    """Test that non-image files are rejected."""
    # Create a text file instead of an image
    text_file = io.BytesIO(b"This is not an image")
    
    headers = {
        "Authorization": "Bearer YOUR_TEST_TOKEN_HERE"
    }
    
    files = {
        "file": ("test.txt", text_file, "text/plain")
    }
    
    response = client.post(
        "/recipes/analyze-ingredients",
        files=files,
        headers=headers
    )
    
    assert response.status_code == 400
    assert "must be an image" in response.json()["detail"].lower()

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
