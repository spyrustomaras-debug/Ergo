from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("WORKER", "Worker"),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="WORKER")

    def __str__(self):
        return f"{self.username} ({self.role})"


class Project(models.Model):
    worker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.worker.username})"
