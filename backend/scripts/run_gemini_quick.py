#!/usr/bin/env python3
import os
import traceback
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai

KEY = os.getenv('GEMINI_API_KEY')
if not KEY:
    print('No GEMINI_API_KEY found; aborting')
    raise SystemExit(1)

genai.configure(api_key=KEY)

candidates = ['models/gemini-2.0-flash', 'models/gemini-2.5-flash', 'models/gemini-2.5-pro']
text_prompt = 'Donne-moi une phrase en français décrivant une recette rapide pour saumon, oeuf, paprika.'

for m in candidates:
    try:
        print('\n== Trying model:', m)
        Model = getattr(genai, 'GenerativeModel', None)
        if Model is None:
            print('GenerativeModel not available in SDK')
            break
        gm = Model(m)
        print('Calling generate_content with positional contents (string)...')
        try:
            out = gm.generate_content(text_prompt)
            print('Call returned:', type(out))
            # result objects typically have .text
            if hasattr(out, 'text'):
                print('out.text:', out.text)
            else:
                # fallback introspection
                try:
                    for attr in ('result', 'content', 'candidates'):
                        if hasattr(out, attr):
                            val = getattr(out, attr)
                            print(f'{attr}:', val)
                except Exception:
                    print('Could not introspect output, repr:')
                    print(repr(out)[:2000])
            print('SUCCESS - stopping tries')
            break
        except Exception:
            print('Positional generate_content failed for model', m)
            traceback.print_exc()
    except Exception:
        print('Error for model', m)
        traceback.print_exc()
else:
    print('No model returned successfully')
