from rest_framework.routers import DefaultRouter

from apps.cargo_departamento.views import CargoDepartamentoViewSet

router = DefaultRouter()
router.register(r'cargos_departamentos', CargoDepartamentoViewSet,basename='cargo_departamentos')

urlpatterns = router.urls