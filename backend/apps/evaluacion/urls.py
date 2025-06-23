from rest_framework.routers import DefaultRouter
from .views import EvaluacionViewSet, CriterioEvaluacionViewSet, ResultadoEvaluacionViewSet

router = DefaultRouter()
router.register(r'evaluaciones', EvaluacionViewSet, basename='evaluacion')
router.register(r'criterios', CriterioEvaluacionViewSet, basename='criterio')
router.register(r'resultados', ResultadoEvaluacionViewSet, basename='resultado')

urlpatterns = router.urls
