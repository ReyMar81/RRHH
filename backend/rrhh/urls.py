from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/', include('security.urls')),
    path('api/', include('apps.empleado.urls')),
    path('api/', include('apps.documento.urls')),
    path('api/', include('apps.departamento.urls')),
    path('api/', include('apps.cargo.urls')),
    path('api/', include('apps.cargo_departamento.urls')),
    path('api/asistencia/', include('apps.asistencia.urls')),
    path('api/', include('apps.horas_extras.urls')),
    path('api/', include('apps.contrato.urls')),
    path('api/', include('apps.tipo.urls')),
    path('api/', include('apps.categoria.urls')),
]