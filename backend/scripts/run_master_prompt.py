#!/usr/bin/env python3
import os
import traceback
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai

KEY = os.getenv('GEMINI_API_KEY')
MODEL_ENV = os.getenv('GEMINI_MODEL')

if not KEY:
    print('No GEMINI_API_KEY found in environment. Put it in .env and retry.')
    raise SystemExit(1)

genai.configure(api_key=KEY)

candidates = []
if MODEL_ENV:
    candidates.append(MODEL_ENV)
# Prefer a more powerful model if available; allow override with GEMINI_FORCE_MODEL env var
force = os.getenv('GEMINI_FORCE_MODEL')
if force:
    candidates.append(force)
candidates += ['models/gemini-2.5-pro', 'models/gemini-2.5-flash', 'models/gemini-2.0-flash']

# Master prompt (French) - simplified for better model compatibility
MASTER_PROMPT = '''Tu es un chef cuisinier expert. Crée une recette simple avec ces ingrédients :
- Tomates
- Carottes
- Oignons
- Pommes de terre
- Viande (choisis le type)

Réponds uniquement en JSON avec ce format :
{
  "title": string,
  "ingredients": [{"item": string, "quantity": string}],
  "equipment": [string],
  "prep_time_minutes": int,
  "cook_time_minutes": int,
  "steps": [{"step": int, "text": string}],
  "difficulty": "facile|moyen|difficile"
}'''

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), 'master_prompt_output.txt')

# Use simpler model with explicit safety settings
model_name = 'models/gemini-2.0-flash'
print('Using model:', model_name)

Model = getattr(genai, 'GenerativeModel', None)
if Model is None:
    raise RuntimeError('GenerativeModel missing in installed SDK')

# Configure safety settings to be more permissive for recipe generation
safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
]

gm = Model(model_name, safety_settings=safety_settings)
print('\nPrompt to be sent:\n')
print(MASTER_PROMPT)

try:
    # call with positional contents (string) as observed earlier
    print('\nCalling generate_content on model...')
    # Limit output size and set a request timeout to avoid very long blocking calls on heavy models
    try:
        gen_config = getattr(genai, 'GenerationConfig', None)
        if gen_config:
            generation_config = gen_config(max_output_tokens=1000)
        else:
            generation_config = None
    except Exception:
        generation_config = None

    # request_options supports passing a timeout; use a reasonable ceiling
    req_opts = {'timeout': 60}

    try:
        if generation_config is not None:
            out = gm.generate_content(MASTER_PROMPT, generation_config=generation_config, request_options=req_opts)
        else:
            out = gm.generate_content(MASTER_PROMPT, request_options=req_opts)
    except Exception as e:
        print('Synchronous generate_content failed or timed out; attempting async variant (generate_content_async)')
        try:
            # try async variant and wait (SDK returns AsyncGenerateContentResponse)
            async_fn = getattr(gm, 'generate_content_async', None)
            if async_fn is not None:
                # call async method synchronously by running an event loop
                import asyncio

                async def run_async():
                    if generation_config is not None:
                        return await gm.generate_content_async(MASTER_PROMPT, generation_config=generation_config, request_options=req_opts)
                    return await gm.generate_content_async(MASTER_PROMPT, request_options=req_opts)

                out = asyncio.run(run_async())
            else:
                raise
        except Exception:
            print('Async fallback also failed:')
            raise
    # try to extract text
    resp_text = None
    try:
        if hasattr(out, 'text'):
            resp_text = out.text
        elif hasattr(out, 'parts'):
            # Try to get text from parts directly
            resp_text = '\n'.join(part.text for part in out.parts)
        else:
            # Print full object details for debugging
            print('\nDebug - Response object:', out)
            print('\nDebug - Response type:', type(out))
            print('\nDebug - Response dir:', dir(out))
            # fallback: represent object
            resp_text = repr(out)

    except Exception as e:
        print('Error extracting text:', str(e))
        resp_text = "ERROR: " + str(e)

    # save to file
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        f.write('MODEL: ' + model_name + '\n\n')
        f.write('PROMPT:\n')
        f.write(MASTER_PROMPT + '\n\n')
        f.write('RESPONSE:\n')
        f.write(resp_text)

    print('\n--- LLM response (truncated to 4000 chars) ---\n')
    print(resp_text[:4000])
    print('\nFull response saved to', OUTPUT_PATH)
except Exception:
    print('generate_content call failed:')
    traceback.print_exc()
    raise
