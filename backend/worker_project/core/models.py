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


# Project model with start and finish dates
class Project(models.Model):
    worker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    start_date = models.DateField(null=True, blank=True)   # Optional start date
    finish_date = models.DateField(null=True, blank=True)  # Optional finish date

    def __str__(self):
        return f"{self.name} ({self.worker.username})"
