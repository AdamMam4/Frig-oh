import urllib.request, json, sys
url='http://localhost:8000/openapi.json'
try:
    data=urllib.request.urlopen(url, timeout=5).read()
    o=json.loads(data)
    for path, ops in o.get('paths', {}).items():
        methods = ', '.join(sorted(ops.keys()))
        print(f"{path} -> {methods}")
except Exception as e:
    print('ERR', e)
    sys.exit(1)
