from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpleadoViewSets

router = DefaultRouter()
router.register(r'',EmpleadoViewSets)

urlpatterns = [
    path('', include(router.urls)),
]
