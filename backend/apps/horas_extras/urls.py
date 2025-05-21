from rest_framework.routers import DefaultRouter

from apps.horas_extras.views import HorasExtrasViewSet

router = DefaultRouter()
router.register(r'horas_extras', HorasExtrasViewSet)

urlpatterns = router.urls