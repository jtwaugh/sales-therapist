import json
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST, require_GET
from django.conf import settings
from .models import Conversation

from transformers import GPT2Tokenizer
from openai import OpenAI


# Replace this string with user job
INITIAL_USER_JOB_DESCRIPTION = "My job is Sales Engineer."

# Hardcode initial prompt
INITIAL_PROMPT = "We're sales professionals who just finished a client meeting. " + INITIAL_USER_JOB_DESCRIPTION + " Absolutely do not apologize. Keep interactions collegial and forward-moving. Be terse and curious, and keep me talking. We need to develop a hypothesis about the client, including whether or not they are qualified."

# Hardcode initial response
INITIAL_RESPONSE = "Hello! Give me a brief description of what happened in the meeting - what did we learn, what are the next steps, and what questions are you now wondering about?"

# Maximum number of tokens (adjust based on model capabilities)
MAX_TOKENS = 2048

ASK_FOR_HYPOTHESIS_PROMPT = "Be terse and specific. Summarize in two sentences what new conviction we developed by reflecting on the meeting."


@ensure_csrf_cookie
@require_POST
def create_conversation(request):
    try:
        # Generate a new session ID or receive it from the request
        data = json.loads(request.body)
        session_id = data.get('session_id')  # Generate or extract session ID

        if session_id is None:
            return JsonResponse({'status': 'invalid_request', 'session_id': None})

        user_name = data.get('user_name')
        user_job = data.get('user_job')
        user_org = data.get('user_org')
        initial_response = data.get('initial_response')

        # Make sure to include user details in the hidden prompt
        initial_prompt = INITIAL_PROMPT.replace(INITIAL_USER_JOB_DESCRIPTION, "My job is " + user_job + " at " + user_org + ". Mention this when asking me questions.")
        initial_context = [{"role": "user", "content": initial_prompt}, {"role": "assistant", "content": initial_response}]


        # Create a new Conversation object with the initial prompt
        conversation, created = Conversation.objects.get_or_create(
            session_id=session_id, 
            user_name=user_name, 
            user_job=user_job, 
            user_org=user_org, 
            defaults={'context': initial_context}
        )

        if created:
            return JsonResponse({'status': 'created', 'session_id': session_id})
        else:
            return JsonResponse({'status': 'already_exists', 'session_id': session_id})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# Load the conversation from the DB, send it to the API, and then save the result
@ensure_csrf_cookie
@require_POST
def generate_text(request):
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        data = json.loads(request.body)
        
        prompt = data.get('prompt')
        session_id = data.get('session_id')
        
        # Assume conversation with session ID exists
        try:
            conversation = Conversation.objects.get(session_id=session_id)
        except Conversation.DoesNotExist:
            return JsonResponse({'error': 'Session not found'}, status=404)

        conversation.context.append({"role": "user", "content": prompt})

        # Naive control on session length
        tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
        while len(tokenizer.encode(json.dumps(conversation.context))) > MAX_TOKENS:
            # Hardcode to keep initial prompt
            conversation.context.pop(1)

        chat_completion = client.chat.completions.create(
            messages=conversation.context,
            model="gpt-3.5-turbo",
        )

        model_response = chat_completion.choices[0].message.content
        conversation.context.append({"role": "assistant", "content": model_response})

        conversation.save()

        return JsonResponse({'generatedText': model_response})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# Load the conversation from the DB, send it to the API, and then return the operating hypothesis
@ensure_csrf_cookie
@require_POST
def generate_hypothesis(request):
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        data = json.loads(request.body)
        
        session_id = data.get('session_id')
        
        # Assume conversation with session ID exists
        try:
            conversation = Conversation.objects.get(session_id=session_id)
        except Conversation.DoesNotExist:
            return JsonResponse({'error': 'Session not found'}, status=404)

        hypothesis_conversation = conversation.context + [{"role": "user", "content": ASK_FOR_HYPOTHESIS_PROMPT}]

        # Naive control on session length
        tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
        while len(tokenizer.encode(json.dumps(hypothesis_conversation))) > MAX_TOKENS:
            # Hardcode to keep initial prompt
            hypothesis_conversation.pop(1)

        chat_completion = client.chat.completions.create(
            messages=hypothesis_conversation,
            model="gpt-3.5-turbo",
            max_tokens=100,
        )

        model_response = chat_completion.choices[0].message.content

        return JsonResponse({'generatedText': model_response})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@ensure_csrf_cookie
@require_GET
# TODO optimize to retrieve only the most recent two responses and append them to what's stored in Redux
def get_conversation_history(request, session_id):
    try:
        conversation = Conversation.objects.get(session_id=session_id)
        # HACK: don't return the hidden prompt
        return JsonResponse({'context': conversation.context[1:]})
    except Conversation.DoesNotExist:
        return JsonResponse({'error': 'Session not found'}, status=404)