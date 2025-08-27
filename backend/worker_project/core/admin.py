from django.contrib import admin
from .models import User, Project

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'role', 'is_staff', 'is_superuser')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'worker', 'created_at')
