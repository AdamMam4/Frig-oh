from pymongo import MongoClient

client = MongoClient('mongodb+srv://BJLAeKLN:FGV7xrJIkw6WPCYJ@us-east-1.ufsuw.mongodb.net/APP5')
db = client['APP5']
res = db.users.update_one({'email':'test@example.com'},{'$set':{'username':'testuser'}})
print('modified_count', res.modified_count)
print(db.users.find_one({'email':'test@example.com'}))
