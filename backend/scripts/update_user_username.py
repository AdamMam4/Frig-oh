from dotenv import load_dotenv
import os
from pymongo import MongoClient

load_dotenv()
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "APP5")

if not MONGODB_URL:
	raise RuntimeError("MONGODB_URL not set in environment. Please set it in your .env or environment variables.")

client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]
res = db.users.update_one({'email':'test@example.com'},{'$set':{'username':'testuser'}})
print('modified_count', res.modified_count)
print(db.users.find_one({'email':'test@example.com'}))
