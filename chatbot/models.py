from django.db import models

class Conversation(models.Model):
    session_id = models.CharField(max_length=100)  # Unique identifier for each session
    user_name = models.CharField(max_length=100)
    user_job = models.CharField(max_length=100)
    user_org = models.CharField(max_length=100)
    context = models.JSONField(default=list)       # Stores the conversation history

    def __str__(self):
        return self.session_id