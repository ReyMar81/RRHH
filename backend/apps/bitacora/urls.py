from rest_framework.routers import DefaultRouter
from .views import LogEntryViewSet
from .bitacora_views import BitacoraViewSet

router = DefaultRouter()
router.register(r'bitacora', LogEntryViewSet, basename='logentry')
router.register(r'bitacora-personalizada', BitacoraViewSet, basename='bitacora')
urlpatterns = router.urls
