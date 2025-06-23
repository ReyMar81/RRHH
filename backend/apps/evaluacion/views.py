from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Evaluacion, CriterioEvaluacion, ResultadoEvaluacion
from .serializer import EvaluacionSerializer, CriterioEvaluacionSerializer, ResultadoEvaluacionSerializer

from apps.empleado.models import Empleado
from apps.horas_extras.models import Aprobadores
from rrhh import settings
from apps.noticacion.models import Notificacion
from datetime import datetime
# Create your views here.

class EvaluacionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EvaluacionSerializer
    
    def get_queryset(self):
        try:
            empleado = Empleado.objects.get(user=self.request.user)
            return Evaluacion.objects.filter(empresa=empleado.empresa)
        except Empleado.DoesNotExist:
            return Evaluacion.objects.none()

    
    
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
        
        existe = Evaluacion.objects.filter(
            evaluado=evaluado,
            solicitador=solicitador,
            estado='pendiente'
        ).exists()
        if existe:
            return Response({'error': 'Ya existe una evaluación pendiente para este empleado'}, status=400)
        
        evaluacion = Evaluacion.objects.create(
            evaluado=evaluado,
            solicitador= solicitador,
            estado='pendiente',
            empresa=solicitador.empresa
        )

        aprobadores = Aprobadores.objects.filter(
            departamento=departamento,
            encargado_de='evaluacion'
            )
        
        url_base = settings.FRONTEND_URL
        
        for aprobador in aprobadores:
            Notificacion.objects.create(
                empleado = aprobador.empleado,
                titulo='Nueva evaluación pendiente',
                mensaje=f'Se solicitó una evaluación para: {evaluado.nombre} {evaluado.apellidos}',
                url = f"{url_base}/evaluaciones/{evaluacion.id}/aceptar", #!  CAMBIAR A URL DONDE SE APRUEBE LA SOLICITUD
                empresa = evaluado.empresa
            )
        return Response({'mensaje': 'Evaluación solicitada correctamente'}, status=201)
    
    @action(detail=False, methods=['get'], url_path='pendientes-evaluar')
    def pendientes_evaluar(self, request):
        try:
            evaluador = Empleado.objects.get(user=request.user)
        except Empleado.DoesNotExist:
            return Response({'error': 'Empleado no encontrado'}, status=404)
        departamentos_autorizados = Aprobadores.objects.filter(
            empleado=evaluador,
            encargado_de='evaluacion'
        ).values_list('departamento', flat=True)
        evaluaciones_pendientes = Evaluacion.objects.filter(
            estado='pendiente',
            evaluador__isnull=True
        )
        evaluaciones_filtradas = [
            e for e in evaluaciones_pendientes
            if e.evaluado.departamento_del_empleado() in departamentos_autorizados
        ]
        serializer = self.get_serializer(evaluaciones_filtradas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='aceptar')
    def aceptar_evaluacion(self, request, pk=None):
        try:
            evaluacion = self.get_object()
            evaluador = Empleado.objects.get(user=request.user)
        except:
            return Response({'error': 'Evaluación o empleado no encontrado'}, status=404)
        if evaluacion.evaluador:
            return Response({'error': 'Ya fue tomada por otro evaluador'}, status=400)
        if not evaluacion.puede_ser_evaluado_por(evaluador):
            return Response({'error': 'No tiene permisos para tomar esta evaluación'}, status=403)

        fecha_fin_str = request.data.get('fecha_fin')
        try:
            fecha_fin = datetime.strptime(fecha_fin_str, '%Y-%m-%d')  # o el formato que uses
        except (TypeError, ValueError):
            return Response({'error': 'Formato de fecha inválido. Use AAAA-MM-DD'}, status=400)

        if not fecha_fin:
            return Response({'error': 'Debe enviar una fecha de fin'}, status=400)
        evaluacion.evaluador = evaluador
        evaluacion.fecha_fin = fecha_fin
        evaluacion.estado = 'en proceso'
        evaluacion.save()
        return Response({'mensaje': 'Evaluación aceptada, puede comenzar a completarla'})




    @action(detail=True, methods=['post'], url_path='agregar-criterio')
    def agregar_criterio(self, request, pk=None):
        try:
            evaluacion = self.get_object()
            evaluador = Empleado.objects.get(user=request.user)
        except:
            return Response({'error': 'Error de autenticación'}, status=404)

        if evaluacion.evaluador != evaluador:
            return Response({'error': 'No tiene permiso para modificar esta evaluación'}, status=403)

        criterio_id = request.data.get('criterio_id')
        puntaje = request.data.get('puntaje')  # opcional en este paso
        comentario = request.data.get('comentario', '')

        try:
            criterio = CriterioEvaluacion.objects.get(id=criterio_id, empresa=evaluador.empresa)
        except CriterioEvaluacion.DoesNotExist:
            return Response({'error': 'Criterio no encontrado'}, status=404)

        ResultadoEvaluacion.objects.create(
            evaluacion=evaluacion,
            criterio=criterio,
            puntaje=puntaje,
            comentario=comentario,
            empresa=evaluador.empresa
        )

        return Response({'mensaje': 'Criterio agregado correctamente'})






    @action(detail=True, methods=['post'], url_path='finalizar')
    def finalizar_evaluacion(self, request, pk=None):
        try:
            evaluacion = self.get_object()
            evaluador = Empleado.objects.get(user=request.user)
        except:
            return Response({'error': 'Error localizando evaluación o empleado'}, status=404)

        if evaluacion.evaluador != evaluador:
            return Response({'error': 'No puede finalizar esta evaluación'}, status=403)

        comentario_general = request.data.get('comentario_general', '')
        evaluacion.comentario_general = comentario_general
        evaluacion.estado = 'completada'
        evaluacion.save()

        return Response({'mensaje': 'Evaluación completada exitosamente'})



class CriterioEvaluacionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CriterioEvaluacionSerializer
    
    def get_queryset(self):
        return CriterioEvaluacion.objects.filter(empresa=self.request.user.empresa)

    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)
        
class ResultadoEvaluacionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ResultadoEvaluacionSerializer
    
    def get_queryset(self):
        return ResultadoEvaluacion.objects.filter(empresa=self.request.user.empresa)

    def perform_create(self, serializer):
        try:
            evaluador = Empleado.objects.get(user=self.request.user)
        except Empleado.DoesNotExist:
            raise PermissionDenied("Empleado no válido.")

        evaluacion = serializer.validated_data.get('evaluacion')

        if evaluacion.evaluador != evaluador:
            raise PermissionDenied("No puede agregar criterios a esta evaluación.")
        serializer.save(empresa=self.request.user.empresa)