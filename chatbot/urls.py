from django.urls import path
from . import views

urlpatterns = [
    path('generate-text/', views.generate_text, name='generate-text'),
    path('generate-hypothesis/', views.generate_hypothesis, name='generate-hypothesis'),
    path('get-conversation/<str:session_id>/', views.get_conversation_history, name='get_conversation_history'),
    path('create-conversation/', views.create_conversation, name='create_conversation'),
]
