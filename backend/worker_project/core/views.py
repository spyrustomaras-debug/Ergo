from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import WorkerRegisterSerializer, AdminRegisterSerializer, UserSerializer
from .models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from .serializers import ProjectSerializer
from .models import Project
from rest_framework.decorators import api_view, action
from rest_framework import status
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework import serializers




class IsWorker(permissions.BasePermission):
    """
    Custom permission: only workers can create projects.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "WORKER"

# Worker Register
class WorkerRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = WorkerRegisterSerializer
    permission_classes = [permissions.AllowAny]


# Admin Register
class AdminRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminRegisterSerializer
    permission_classes = [permissions.AllowAny]   # (optionally: restrict to superuser)


# Custom JWT login with role in response
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            data = super().validate(attrs)
        except Exception:
            # Raise as plain string to get {"detail": "..."}
            raise serializers.ValidationError("Wrong username or password")
        
        # Add user info to response
        data["user"] = UserSerializer(self.user).data
        return data

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            # Invalid token internally
            return Response({"detail": "Wrong username or password"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            # Any other failure
            return Response({"detail": "Wrong username or password"}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    
class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]  # Default permission

    def get_permissions(self):
        """
        Customize permissions based on action
        """
        if self.action == "create":
            # Only workers can create projects
            return [IsWorker()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            # Admin sees all projects
            return Project.objects.all()
        # Worker sees only their own projects
        return Project.objects.filter(worker=user)

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the worker
        serializer.save(worker=self.request.user)
        
        # Custom endpoint for grouped projects (only for admin)
    @action(detail=False, methods=["GET"], permission_classes=[permissions.IsAuthenticated])
    def grouped_projects(self, request):
            user = request.user
            if user.role != "ADMIN":
                return Response({"detail": "You are not authorized"}, status=403)

            workers = User.objects.filter(role="WORKER")
            data = []
            for w in workers:
                projects = Project.objects.filter(worker=w)
                data.append({
                    "worker": UserSerializer(w).data,
                    "projects": ProjectSerializer(projects, many=True).data
                })
            return Response(data)
        


    


@api_view(["GET"])
def api_root(request):
    return Response({
        "register_worker": "/api/register/worker/",
        "register_admin": "/api/register/admin/",
        "login": "/api/login/",
        "refresh_token": "/api/token/refresh/",
        "projects": "/api/projects/"
    })

