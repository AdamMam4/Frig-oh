import httpx
import sys

try:
    r = httpx.post('http://127.0.0.1:8000/auth/login', json={'email':'test@example.com','password':'testpassword123'}, timeout=10.0)
    print('LOGIN_STATUS', r.status_code)
    print(r.text)
except Exception as e:
    print('ERROR', repr(e))
    sys.exit(1)
