from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.empresas.views import EmpresaViewSet

router = DefaultRouter()
# Empresa
router.register(r'empresas', EmpresaViewSet, basename='empresa')

urlpatterns = [
    path('api/', include(router.urls)),
]
