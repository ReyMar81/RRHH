from rest_framework.routers import DefaultRouter
from .views import NotificacionViewSet

router = DefaultRouter()
router.register(r'Notificacion', NotificacionViewSet,basename='Notificacion')

urlpatterns = router.urls
