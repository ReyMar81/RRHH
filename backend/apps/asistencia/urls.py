from rest_framework.routers import DefaultRouter

from apps.asistencia.views import AsistenciViewSet

router = DefaultRouter()
router.register(r'asistencias', AsistenciViewSet)

urlpatterns = router.urls