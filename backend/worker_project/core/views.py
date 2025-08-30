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
from .serializers import PasswordResetSerializer, PasswordResetConfirmSerializer
from rest_framework.views import APIView


class WorkerPasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password reset email sent."}, status=status.HTTP_200_OK)

class WorkerPasswordResetConfirmView(APIView):
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK)

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
        if self.action == "create":
            return [IsWorker()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == "ADMIN":
            return Project.objects.all()
        return Project.objects.filter(worker=user)

    def perform_create(self, serializer):
        serializer.save(worker=self.request.user)

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

    @action(detail=False, methods=["GET"], permission_classes=[permissions.IsAuthenticated])
    def search(self, request):
        name = request.query_params.get("name", "").strip()
        if not name:
            return Response({"detail": "Please provide a project name (?name=...)"}, status=400)

        projects = Project.objects.filter(worker=request.user, name__iexact=name)
        if not projects.exists():
            return Response({"detail": f"No project found with name '{name}'"}, status=404)

        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsWorker])
    def update_status(self, request, pk=None):
        try:
            project = self.get_queryset().get(pk=pk)
        except Project.DoesNotExist:
            # Check if project exists at all
            if Project.objects.filter(pk=pk).exists():
                return Response(
                    {"detail": "You are not authorized to update this project"},
                    status=status.HTTP_403_FORBIDDEN
                )
            else:
                return Response(
                    {"detail": "Project not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

        
         # Prevent Admin from updating status
        if request.user.role == "ADMIN":
            return Response(
                {"detail": "Admins are not allowed to update project status"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if project.worker != request.user:
            return Response(
                {"detail": f"You cannot update project '{project.name}' because it does not belong to you."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if project.worker != request.user:
            return Response({"detail": "Not authorized"}, status=403)

        status_value = request.data.get("status")
        if status_value not in ["PENDING", "IN_PROGRESS", "COMPLETED"]:
            return Response({"detail": "Invalid status"}, status=400)

        project.status = status_value
        project.save()
        serializer = self.get_serializer(project)
        return Response(serializer.data)



@api_view(["GET"])
def api_root(request):
    return Response({
        "register_worker": "/api/register/worker/",
        "register_admin": "/api/register/admin/",
        "login": "/api/login/",
        "refresh_token": "/api/token/refresh/",
        "projects": "/api/projects/"
    })

