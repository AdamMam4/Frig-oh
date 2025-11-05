from dotenv import load_dotenv
import os
import sys
from pathlib import Path
# Ensure project root is on sys.path so `import app` works when running this script
project_root = Path(__file__).resolve().parents[1]
sys.path.append(str(project_root))

from pymongo import MongoClient
from app.services.auth import AuthService
from datetime import datetime

load_dotenv()

MONGODB_URL = os.getenv('MONGODB_URL')
DATABASE_NAME = os.getenv('DATABASE_NAME')

# User data (from request)
email = 'younes@gmail.com'
username = 'ynsyns'
password = 'russie'

# Hash password
auth = AuthService()
hashed = auth.get_password_hash(password)

client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

user_doc = {
    'email': email,
    'username': username,
    'hashed_password': hashed,
    'created_at': datetime.utcnow()
}

res = db.users.insert_one(user_doc)
print('Inserted user _id:', res.inserted_id)
client.close()
