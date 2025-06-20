from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
from security.views import UserThemeView, UserDetailView
from security.group_views import GroupViewSet, EmpresaPermissionViewSet
from .usuario_rol_views import AsignarRolUsuarioView
from security.views import CustomTokenObtainPairView

router = DefaultRouter()
router.register(r'roles', GroupViewSet, basename='roles')
router.register(r'permisos-disponibles', EmpresaPermissionViewSet, basename='permisos-disponibles')

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('theme/', UserThemeView.as_view(), name='user_theme'),
    path('user/', UserDetailView.as_view(), name='user_detail'),
    path('asignar-rol/', AsignarRolUsuarioView.as_view(), name='asignar-rol-usuario'),
]
urlpatterns += router.urls