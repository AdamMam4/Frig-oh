#!/usr/bin/env python3
import google.generativeai as genai
from dotenv import load_dotenv
import os, inspect
load_dotenv()
KEY=os.getenv('GEMINI_API_KEY')
if not KEY:
    print('no key')
    raise SystemExit(1)
genai.configure(api_key=KEY)
Model = getattr(genai, 'GenerativeModel', None)
print('GenerativeModel?', bool(Model))
if Model:
    print('Model doc:')
    print(Model.__doc__)
    print('\nPublic members:')
    public = [n for n in dir(Model) if not n.startswith('_')]
    print(public)
    if hasattr(Model, 'generate_content'):
        print('\nSignature of generate_content:')
        print(inspect.signature(Model.generate_content))
    if hasattr(Model, 'generate_content_async'):
        print('\nSignature of generate_content_async:')
        print(inspect.signature(Model.generate_content_async))
    if hasattr(Model, 'start_chat'):
        print('\nSignature of start_chat:')
        print(inspect.signature(Model.start_chat))
