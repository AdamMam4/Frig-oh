#!/usr/bin/env python3
import os
import json
import traceback
from dotenv import load_dotenv

load_dotenv()

try:
    import google.generativeai as genai
except Exception as e:
    print('Error importing google.generativeai:', e)
    raise


def pretty(obj):
    try:
        return json.dumps(obj, indent=2, default=str, ensure_ascii=False)
    except Exception:
        return repr(obj)


if __name__ == '__main__':
    KEY = os.getenv('GEMINI_API_KEY')
    print('GEMINI_API_KEY present:', bool(KEY))

    if not KEY:
        print('No GEMINI_API_KEY found in environment. Please add it to your .env and retry.')
        raise SystemExit(1)

    try:
        genai.configure(api_key=KEY)
        print('Configured google.generativeai')
    except Exception:
        print('Failed to configure google.generativeai:')
        traceback.print_exc()
        raise

    # list models (list_models may return a generator)
    try:
        models_gen = genai.list_models()
        models = list(models_gen)
        print('\nAvailable models (first 20):')
        for m in models[:20]:
            # model object may be simple dict-like
            name = getattr(m, 'name', None) or (m.get('name') if isinstance(m, dict) else None)
            print('-', name)
    except Exception:
        print('list_models() failed:')
        traceback.print_exc()
        models = []

    # pick a model
    preferred = [
        'models/gemini-2.5-pro',
        'models/gemini-pro-latest',
        'models/gemini-2.1-mini',
        'models/gemini-2.5',
    ]
    model_name = None
    for p in preferred:
        if any((getattr(m, 'name', None) == p) or (isinstance(m, dict) and m.get('name') == p) for m in models):
            model_name = p
            break
    if not model_name and models:
        # fallback to first model name
        first = models[0]
        model_name = getattr(first, 'name', None) or (first.get('name') if isinstance(first, dict) else None)

    print('\nUsing model:', model_name)

    if not model_name:
        print('No model selected from list_models(); skipping generation attempts.')
        print('\nDone.')
        raise SystemExit(0)

    # try different call styles depending on SDK
    text_prompt = 'Donne-moi une courte recette de 2 lignes pour "saumon oeuf paprika" en français.'

    # 1) try genai.generate
    try:
        print('\n--- Trying genai.generate(model=..., prompt=...) ---')
        resp = genai.generate(model=model_name, prompt=text_prompt)
        print('type(resp):', type(resp))
        print('repr(resp):', repr(resp)[:1000])
        try:
            print('\nAs dict-ish:')
            print(pretty(resp))
        except Exception:
            pass
    except Exception:
        print('genai.generate failed:')
        traceback.print_exc()

    # 2) try genai.generate_text
    try:
        print('\n--- Trying genai.generate_text(model=..., prompt=...) ---')
        resp2 = genai.generate_text(model=model_name, prompt=text_prompt)
        print('type(resp2):', type(resp2))
        print('repr(resp2):', repr(resp2)[:1000])
        try:
            print('\nAs dict-ish:')
            print(pretty(resp2))
        except Exception:
            pass
    except Exception:
        print('genai.generate_text failed:')
        traceback.print_exc()

    # 3) try GenerativeModel API (older/newer wrappers)
    try:
        print('\n--- Trying GenerativeModel(...) API ---')
        Model = getattr(genai, 'GenerativeModel', None)
        if Model is None:
            print('google.generativeai has no attribute GenerativeModel')
        else:
            gm = Model(model_name)
            print('Instantiated GenerativeModel, listing public attributes:')
            public = [n for n in dir(gm) if not n.startswith('_')]
            print(public)

            # look for candidate methods that might generate text
            candidate_methods = [n for n in public if any(k in n for k in ('generate', 'predict', 'create', 'content'))]
            print('Candidate methods to try:', candidate_methods)

            for meth_name in candidate_methods:
                meth = getattr(gm, meth_name)
                if not callable(meth):
                    continue
                print(f"\nTrying gm.{meth_name}(...)")
                try:
                    # try with a simple positional string; if method expects kwargs, this will raise and we catch
                    result = meth(text_prompt)
                    print(f'Result type for {meth_name}:', type(result))
                    print('repr(result)[:1000]:', repr(result)[:1000])
                    try:
                        print('As dict-ish:')
                        print(pretty(result))
                    except Exception:
                        pass
                except TypeError:
                    # try calling with common kwarg names
                    for kw in ({'prompt': text_prompt}, {'input': text_prompt}, {'text': text_prompt}):
                        try:
                            print(f"Trying {meth_name} with kwargs {list(kw.keys())} (and timeout=20)...")
                            # try with a timeout kw if the SDK supports it (gRPC clients often accept timeout)
                            try:
                                result = meth(timeout=20, **kw)
                            except TypeError:
                                result = meth(**kw)
                            print(f'Result type for {meth_name} with kwargs {list(kw.keys())}:', type(result))
                            print('repr(result)[:1000]:', repr(result)[:1000])
                            try:
                                print('As dict-ish:')
                                print(pretty(result))
                            except Exception:
                                pass
                            break
                        except Exception:
                            print(f'{meth_name} with kwargs {list(kw.keys())} failed:')
                            traceback.print_exc()
                except Exception:
                    print(f'{meth_name} call failed:')
                    traceback.print_exc()
    except Exception:
        print('GenerativeModel API attempt failed:')
        traceback.print_exc()

    print('\nDone.')
