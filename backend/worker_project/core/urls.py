from django.urls import path, include
from .views import WorkerRegisterView, AdminRegisterView, CustomLoginView, api_root
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet
from django.contrib import admin

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="projects")

urlpatterns = [
    path("", api_root, name="api_root"),  # 👈 now /api/ works
    path("register/worker/", WorkerRegisterView.as_view(), name="register_worker"),
    path("register/admin/", AdminRegisterView.as_view(), name="register_admin"),
    path("login/", CustomLoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("", include(router.urls)),  # for /api/projects/

]
