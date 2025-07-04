from rest_framework.routers import DefaultRouter

from apps.cargo.views import CargoViewSet

router = DefaultRouter()
router.register(r'cargos', CargoViewSet,basename='cargo')

urlpatterns = router.urls