from rest_framework.routers import DefaultRouter

from apps.contrato.views import ContratoViewSet

router = DefaultRouter()
router.register(r'contratos', ContratoViewSet,basename='contratos')

urlpatterns = router.urls