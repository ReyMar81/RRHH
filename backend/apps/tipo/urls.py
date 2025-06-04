from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import TipoViewSet

router = DefaultRouter()
router.register(r'tipos', TipoViewSet, basename='tipo')

urlpatterns = [
    path('', include(router.urls)),
]
