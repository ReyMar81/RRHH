from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CambiarPasswordEmpleadoView, EmpleadoViewSets

router = DefaultRouter()
router.register(r'empleados', EmpleadoViewSets, basename='empleado')

urlpatterns = [
    path('', include(router.urls)),
    path(
        'empleados/<int:empleado_id>/cambiar_password/',
        CambiarPasswordEmpleadoView.as_view(),
        name='cambiar_password_empleado'
    ),
]