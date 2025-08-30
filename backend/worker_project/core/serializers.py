from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User
from .models import Project

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail

from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator

User = get_user_model()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

    def validate(self, data):
        try:
            uid = urlsafe_base64_decode(data["uidb64"]).decode()
            user = User.objects.get(pk=uid, role="WORKER")
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            raise serializers.ValidationError("Invalid user")

        if not default_token_generator.check_token(user, data["token"]):
            raise serializers.ValidationError("Invalid or expired token")

        data["user"] = user
        return data

    def save(self):
        user = self.validated_data["user"]
        user.set_password(self.validated_data["new_password"])
        user.save()

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value, role="WORKER").exists():
            raise serializers.ValidationError("Worker with this email does not exist")
        return value

    def save(self):
        email = self.validated_data["email"]
        user = User.objects.get(email=email, role="WORKER")
        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))

        # Construct reset link
        reset_link = f"http://localhost:3000/reset-password/{uidb64}/{token}/"
        
        # Print the link in the console for testing
        print(f"Password reset link for {email}: {reset_link}")

        # Send email (console backend will print to terminal in dev)
        send_mail(
            subject="Worker Password Reset",
            message=f"Click the link to reset your password: {reset_link}",
            from_email="noreply@example.com",
            recipient_list=[email],
        )

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id',
            'worker',
            'name',
            'description',
            'created_at',
            'start_date',
            'finish_date',
            'status',
            'latitude',    # ✅ new
            'longitude',   # ✅ new
        ]
        read_only_fields = ['worker', 'created_at']  # worker cannot be changed
        
    def create(self, validated_data):
        # Assign the current user as the worker
        user = self.context['request'].user
        return Project.objects.create(worker=user, **validated_data)
        



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
