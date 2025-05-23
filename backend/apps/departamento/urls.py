from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import DepartamentoViewSet, CargosPorDepartamentoView, EmpleadosActivosPorDepartamentoView

router = DefaultRouter()
router.register(r'departamentos', DepartamentoViewSet)

urlpatterns = router.urls + [
    path('departamentos/<int:id>/cargos/', CargosPorDepartamentoView.as_view(), name='departamento-cargos'),
    path('departamentos/<int:id>/empleados/', EmpleadosActivosPorDepartamentoView.as_view(), name='departamento-empleados'),
]
