from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CambiarPasswordEmpleadoView, EmpleadoViewSets, ReporteEmpleadosExcelView, ReporteEmpleadosPdfView

router = DefaultRouter()
router.register(r'empleados', EmpleadoViewSets, basename='empleado')

urlpatterns = [
    path('', include(router.urls)),
    path(
        'empleados/<int:empleado_id>/cambiar_password/',
        CambiarPasswordEmpleadoView.as_view(),
        name='cambiar_password_empleado'
    ),
    path('reportes/reporte_empleados_excel/', ReporteEmpleadosExcelView.as_view(), name='reporte_empleados_excel'),
    path('reportes/reporte_empleados_pdf/', ReporteEmpleadosPdfView.as_view(), name='reporte_empleados_pdf'),
]