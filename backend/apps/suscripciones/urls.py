from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.suscripciones.views import PlanViewSet, SuscripcionViewSet, PlanesPrivilegiosViewSet

router = DefaultRouter()

# Suscripciones (planes, suscripciones, privilegios)
router.register(r'planes', PlanViewSet, basename='plan')
router.register(r'suscripciones', SuscripcionViewSet, basename='suscripcion')
router.register(r'planes-privilegios', PlanesPrivilegiosViewSet, basename='planes-privilegios')

urlpatterns = [
    path('api/', include(router.urls)),
]
