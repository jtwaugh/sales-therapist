from django.contrib import admin
from .models import User, UserSession, Feedback
from chatbot.models import Conversation

# Register your models here.
admin.site.register(User)
admin.site.register(UserSession)
admin.site.register(Feedback)
admin.site.register(Conversation)