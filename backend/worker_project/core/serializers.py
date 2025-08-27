from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    worker = serializers.ReadOnlyField(source='worker.username')  # show username instead of ID

    class Meta:
        model = Project
        fields = ['id', 'worker', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'worker', 'created_at']

# Worker registration
class WorkerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]
        read_only_fields = ["id", "role"]  # role is automatically "WORKER"


    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            role="WORKER"
        )
        user.set_password(validated_data["password"])
        user.save()
        return user


# Admin registration
class AdminRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]
        read_only_fields = ["id", "role"]


    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            role="ADMIN"
        )
        user.set_password(validated_data["password"])
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user


# Show user info (after login)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]
