"""
Simple integration test: login (email+password) then create a recipe.
Designed to be run locally while uvicorn is running.
Exits with non-zero code on failure.
"""
import sys
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
EMAIL = "test@example.com"
PASSWORD = "testpassword123"


def fail(msg, code=1):
    print("ERROR:", msg)
    sys.exit(code)


def main():
    try:
        with httpx.Client(timeout=15.0) as client:
            # Login
            print("-> Logging in...")
            r = client.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
            print("Login status:", r.status_code)
            if r.status_code != 200:
                fail(f"Login failed: {r.status_code} {r.text}")

            token = r.json().get("access_token")
            if not token:
                fail("No access token returned")

            headers = {"Authorization": f"Bearer {token}"}

            # Create recipe
            print("-> Creating recipe...")
            recipe = {
                "title": "Saumon aux œufs et paprika",
                "description": "Une délicieuse recette",
                "ingredients": ["2 pavés de saumon", "4 œufs", "1 cuillère à café de paprika"],
                "instructions": ["Assaisonner et cuire"],
                "cooking_time": 20,
                "difficulty": "EASY",
                "servings": 2
            }

            r2 = client.post(f"{BASE_URL}/recipes/", json=recipe, headers=headers)
            print("Create recipe status:", r2.status_code)
            print(r2.text)
            if r2.status_code != 200 and r2.status_code != 201:
                fail(f"Recipe creation failed: {r2.status_code} {r2.text}")

            print("Integration test succeeded.")
            return 0

    except Exception as e:
        fail(str(e))


if __name__ == "__main__":
    sys.exit(main())
