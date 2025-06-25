from rest_framework.routers import DefaultRouter

from apps.horas_extras.views import HorasExtrasViewSet,AprobadoresDeHorasExtraViewSet

router = DefaultRouter()
router.register(r'horas_extras', HorasExtrasViewSet,basename='horas_extras')
router.register(r'Aprobadores', AprobadoresDeHorasExtraViewSet,basename='Aprobadores')


urlpatterns = router.urls