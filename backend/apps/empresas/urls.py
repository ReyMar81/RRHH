from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.empresas.views import EmpresaViewSet, EmpresaRegistroView

router = DefaultRouter()
# Empresa
router.register(r'empresas', EmpresaViewSet, basename='empresa')

urlpatterns = router.urls + [
    path('registro-empresa/', EmpresaRegistroView.as_view(), name='registro-empresa'),
]
