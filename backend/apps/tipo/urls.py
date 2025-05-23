from rest_framework.routers import DefaultRouter
from .views import TipoViewSet

router = DefaultRouter()
router.register(r'tipos', TipoViewSet)

urlpatterns = router.urls