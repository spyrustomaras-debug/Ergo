from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import WorkerRegisterSerializer, AdminRegisterSerializer, UserSerializer
from .models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets, permissions
from .serializers import ProjectSerializer

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
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return Project.objects.all()  # Admin sees all projects
        return Project.objects.filter(worker=user)  # Worker sees only their own

    def perform_create(self, serializer):
        serializer.save(worker=self.request.user)
    


@api_view(["GET"])
def api_root(request):
    return Response({
        "register_worker": "/api/register/worker/",
        "register_admin": "/api/register/admin/",
        "login": "/api/login/",
        "refresh_token": "/api/token/refresh/",
        "projects": "/api/projects/"
    })

