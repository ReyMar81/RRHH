from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Evaluacion, CriterioEvaluacion, ResultadoEvaluacion
from .serializer import EvaluacionSerializer, CriterioEvaluacionSereializer, ResultadoEvaluacionSereializer

from apps.empleado.models import Empleado
from apps.horas_extras.models import Aprobadores
from rrhh import settings
from apps.noticacion.models import Notificacion
# Create your views here.

class EvaluacionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EvaluacionSerializer
    
    def get_queryset(self):
        return Evaluacion.objects.filter(empresa=self.request.user.empresa)
    
    
    @action(detail=False, methods=['post'], url_path='solicitar')
    def solicitar_evaluacion(self, request):
        try:
            solicitador = Empleado.objects.get(user=request.user)
        except Empleado.DoesNotExist:
            return Response({'error': 'solicitador no encontrado'}, status=404)
        
        evaluado_id = request.data.get('evaluado')
        if not evaluado_id:
            return Response({'error': 'Debe enviar el campo evaluado'}, status=400)

        try:
            evaluado = Empleado.objects.get(pk=evaluado_id)
        except Empleado.DoesNotExist:
            return Response({'error': 'Empleado a evaluar no encontrado'}, status=404)
        
        departamento = evaluado.departamento_del_empleado()
        if not departamento:
            raise ValueError('El evaluado no tiene un departamento asignado')
        
        evaluacion = Evaluacion.objects.create(
            evaluado=evaluado,
            solicitador= solicitador,
            estado='pendiente',
            empresa=self.request.user.empresa 
        )

        aprobadores = Aprobadores.objects.filter(
            departamento=departamento,
            encargado_de='evaluacion'
            )
        
        url_base = settings.FRONTEND_URL
        
        for aprobador in aprobadores:
            Notificacion.objects.create(
                user = aprobador.empleado,
                titulo='Nueva evaluación pendiente',
                mensaje=f'Se solicitó una evaluación para: {evaluado.nombre} {evaluado.apellidos}',
                url = f'{url_base}/evaluaciones/{evaluacion.id}/realizar', #!  CAMBIAR A URL DONDE SE APRUEBE LA SOLICITUD
                empresa = evaluado.empresa
            )
        return Response({'mensaje': 'Evaluación solicitada correctamente'}, status=201)