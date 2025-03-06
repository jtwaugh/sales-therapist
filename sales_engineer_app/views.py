from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse, HttpResponse
from .forms import UserForm
from .models import Feedback, UserSession, User
from django.views.decorators.http import require_POST
import uuid
import json


def switch_scenario(request, scenario_name):
    request.session['scenario'] = scenario_name
    return redirect('home')  # Redirect to your desired view


def load_scenario_data(request):
    scenario = request.session.get('scenario')
    db_name = f'sandbox_{scenario}'
    
    # Clear the existing data in the sandbox database
    User.objects.using(db_name).all().delete()
    
    # Populate the sandbox database with predefined data
    if scenario == 'manager':
        # Add banking scenario data
        User.objects.using(db_name).create(name='Bob', role='Sales', company='neocore.ai')
    elif scenario == 'meeting':
        pass

    return JsonResponse({'status': 'success'})


@ensure_csrf_cookie
@require_POST
def create_user(request):
    form = UserForm(request.POST)
    if form.is_valid():
        user = form.save()
        return JsonResponse({'status': 'success', 'user_id': user.id})
    else:
        return JsonResponse({'errors': form.errors}, status=400)


@ensure_csrf_cookie
def index(request):
    return render(request, "index.html")


@ensure_csrf_cookie
def check_new_ip(request):
    return JsonResponse({'isNewUser': True})


@ensure_csrf_cookie
def check_new_user(request):
    response = HttpResponse()
    if 'user_id' not in request.COOKIES:
        # New user
        user_id = uuid.uuid4()
        response.set_cookie('user_id', str(user_id), max_age=365*24*60*60)  # Set cookie for 1 year
        response['X-User-Status'] = 'New'
    else:
        response['X-User-Status'] = 'Returning'  # Custom header

    response['Access-Control-Expose-Headers'] = 'X-User-Status'  

    print(response)

    return response


@ensure_csrf_cookie
@require_POST
def submit_feedback(request):
    data = json.loads(request.body)
    feedback_content = data.get('feedback')
    session_id = data.get('sessionId')

    session = UserSession.objects.get(id=session_id)

    if session is None:
        return JsonResponse({"status": "error", "message": "Session with give ID does not exist"}, status=404)

    feedback = Feedback(content=feedback_content, session=session)
    feedback.save()

    return JsonResponse({"status": "success"})


@ensure_csrf_cookie
@require_POST
def create_user_session(request):
    try:
        data = json.loads(request.body)
        session_id = data.get('session_id')  # Generate or extract session ID
        user_id = data.get('user_id')  # Generate or extract session ID
        
        if not session_id:
            return JsonResponse({"status": "error", "message": "Session ID not provided."}, status=400)

        if not user_id:
            return JsonResponse({"status": "error", "message": "User ID not provided."}, status=400)
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"status": "error", "message": "User not found."}, status=404)

        # Create a new user session with the provided session ID
        session = UserSession.objects.create(id=session_id, user=user)
        return JsonResponse({"status": "success", "session_id": session.id, "user_id": session.user.id})

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)