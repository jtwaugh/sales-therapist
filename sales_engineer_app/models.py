from django.db import models
import uuid


# NOTE: not for authentication; only for keeping sessions together
class User(models.Model):
    ip_address = models.CharField(max_length=15)
    personal_name = models.CharField(max_length=100)
    job_title = models.CharField(max_length=100)
    organization = models.CharField(max_length=100)

    def initials(self):
        return ''.join(name[0].upper() for name in self.personal_name.split())


class UserSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Session {self.id} for user {self.user.personal_name if self.user else 'Anonymous'}"
    

class Feedback(models.Model):
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    session = models.ForeignKey(UserSession, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Feedback: {self.content[:50]}"
    

# These are all models for just running through the pre-meeting workflow
class Client(models.Model):
    name = models.CharField(max_length=100)


class MeetingAttendee(models.Model):
    name = models.CharField(max_length=100)
    organization = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    job_title = models.CharField(max_length=100)


class StrategicQuestion(models.Model):
    text = models.CharField(max_length=500)