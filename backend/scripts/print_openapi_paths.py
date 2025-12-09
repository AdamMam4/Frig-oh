import urllib.request, json, sys
url='http://localhost:8000/openapi.json'
try:
    data=urllib.request.urlopen(url, timeout=5).read()
    o=json.loads(data)
    print('title:', o.get('info',{}).get('title'))
    paths=sorted(o.get('paths',{}).keys())
    print('paths_count:', len(paths))
    for p in paths:
        print(p)
except Exception as e:
    print('ERR', e)
    sys.exit(1)
