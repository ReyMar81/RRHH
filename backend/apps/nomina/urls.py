from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EstructuraSalarialViewSet, ReglaSalarialViewSet, BoletaPagoViewSet, DetalleBoletaPagoViewSet
from .views import GenerarNominaMasivaView, GenerarNominaManualView, ClonarEstructuraPlantillaView, PaisListView, BoletasPorEmpleadoView

router = DefaultRouter()
router.register(r'estructuras', EstructuraSalarialViewSet, basename='estructura')
router.register(r'reglas', ReglaSalarialViewSet, basename='regla')
router.register(r'boletas', BoletaPagoViewSet, basename='boleta')
router.register(r'detalles', DetalleBoletaPagoViewSet, basename='detalle')

urlpatterns = router.urls + [
    path('generar-masiva/', GenerarNominaMasivaView.as_view(), name='generar_nomina_masiva'),
    path('generar-manual/', GenerarNominaManualView.as_view(), name='generar_nomina_manual'),
    path('clonar-estructura/', ClonarEstructuraPlantillaView.as_view(), name='clonar_estructura_plantilla'),
    path('pais/', PaisListView.as_view(), name='pais_list'),
    path('boletas-empleado/<int:empleado_id>/', BoletasPorEmpleadoView.as_view(), name='boletas_por_empleado'),
]
