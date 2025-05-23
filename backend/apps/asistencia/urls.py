from django.urls import path
from .views import AsistenciaViewSet, EstadoAsistenciaAPIView, MisAsistenciasAPIView, RegistroAsistenciaViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'asistencias', AsistenciaViewSet, basename='asistencias')

registro_asistencia = RegistroAsistenciaViewSet.as_view({'post': 'create'})

urlpatterns = [
    path('registrar/', registro_asistencia, name='registrar-asistencia'),
    path('mis_asistencias/', MisAsistenciasAPIView.as_view(), name='mis-asistencias'),
    path('estado_asistencia/', EstadoAsistenciaAPIView.as_view(), name='estado-asistencia'),
]

urlpatterns += router.urls