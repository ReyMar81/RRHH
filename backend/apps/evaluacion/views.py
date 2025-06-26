from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Evaluacion, CriterioEvaluacion, ResultadoEvaluacion
from .serializer import EvaluacionSerializer, CriterioEvaluacionSerializer, ResultadoEvaluacionSerializer

from apps.empleado.models import Empleado
from apps.horas_extras.models import Aprobadores
from apps.contrato.models import Contrato
from rrhh import settings
from apps.noticacion.models import Notificacion
from datetime import datetime
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiResponse
# Create your views here.

class EvaluacionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EvaluacionSerializer
    
    def get_queryset(self):
        try:
            empleado = Empleado.objects.get(user_id=self.request.user)
            return Evaluacion.objects.filter(empresa=empleado.empresa)
        except Empleado.DoesNotExist:
            return Evaluacion.objects.none()

    
    
    @extend_schema(
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "evaluado": {"type": "integer", "description": "ID del empleado a evaluar"},
                    "motivo": {"type": "string", "description": "Motivo de la evaluación"}
                },
                "required": ["evaluado", "motivo"]
            }
        },
        responses={201: OpenApiResponse(description="Evaluación solicitada correctamente", examples=[{"mensaje": "Evaluación solicitada correctamente"}])},
        summary="Solicitar evaluación"
    )
    @action(detail=False, methods=['post'], url_path='solicitar')
    def solicitar_evaluacion(self, request):
        try:
            solicitador = Empleado.objects.get(user_id=request.user)
        except Empleado.DoesNotExist:
            return Response({'error': 'solicitador no encontrado'}, status=404)
        
        evaluado_id = request.data.get('evaluado')
        if not evaluado_id:
            return Response({'error': 'Debe enviar el campo evaluado'}, status=400)

        motivo_evaluacion = request.data.get('motivo')
        if not motivo_evaluacion:
            return Response({'error': 'Debe enviar el motivo de la evaluacion'}, status=400)
        
        try:
            evaluado = Empleado.objects.get(pk=evaluado_id)
        except Empleado.DoesNotExist:
            return Response({'error': 'Empleado a evaluar no encontrado'}, status=404)
        
        departamento = evaluado.departamento_del_empleado()
        if not departamento:
            raise ValueError('El evaluado no tiene un departamento asignado')
        
        if solicitador.departamento_del_empleado() != departamento:
            raise ValueError('El solictador solo puede pedir evaluaciones para su mismo departamento')
        existe = Evaluacion.objects.filter(
            evaluado=evaluado,
            solicitador=solicitador,
            estado='pendiente'
        ).exists()
        if existe:
            return Response({'error': 'Ya existe una evaluación pendiente para este empleado'}, status=400)
        
        evaluacion = Evaluacion.objects.create(
            motivo=motivo_evaluacion,
            evaluado=evaluado,
            solicitador= solicitador,
            estado='pendiente',
            empresa=solicitador.empresa
        )

        aprobadores = Aprobadores.objects.filter(
            departamento=departamento,
            encargado_de='evaluacion',
            empresa = solicitador.empresa
            )
        
        url_base = settings.FRONTEND_URL
        
        for aprobador in aprobadores:
            Notificacion.objects.create(
                empleado = aprobador.empleado,
                titulo='Nueva evaluación pendiente',
                mensaje=f'Se solicitó una evaluación para: {evaluado.nombre} {evaluado.apellidos}\n'
                        f'El siguiente motivo: {motivo_evaluacion}',
                url = f"{url_base}/evaluaciones/{evaluacion.id}/aceptar",
                empresa = evaluado.empresa
            )
        return Response({'mensaje': 'Evaluación solicitada correctamente'}, status=201)
    
    @extend_schema(
        responses=EvaluacionSerializer(many=True),
        summary="Listar evaluaciones pendientes de evaluar"
    )
    @action(detail=False, methods=['get'], url_path='pendientes-evaluar')
    def pendientes_evaluar(self, request):
        try:
            evaluador = Empleado.objects.get(user_id=request.user)
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
            if e.evaluado.departamento_del_empleado().id in departamentos_autorizados and
            e.evaluado != evaluador
        ]
        serializer = self.get_serializer(evaluaciones_filtradas, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "fecha_fin": {
                        "type": "string",
                        "format": "date",
                        "example": "01-07-2025",
                        "description": "Fecha de fin de la evaluación (DD-MM-YYYY)"
                    }
                },
                "required": ["fecha_fin"]
            }
        },
        responses={200: OpenApiResponse(description="Evaluación aceptada", examples=[{"mensaje": "Evaluación aceptada, puede comenzar a completarla"}])},
        summary="Aceptar evaluación"
    )
    @action(detail=True, methods=['patch'], url_path='aceptar')
    def aceptar_evaluacion(self, request, pk=None):
        try:
            evaluacion = self.get_object()
            evaluador = Empleado.objects.get(user_id=request.user)
        except:
            return Response({'error': 'Evaluación o empleado no encontrado'}, status=404)
        if evaluacion.evaluador:
            return Response({'error': 'Ya fue tomada por otro evaluador'}, status=400)
        if not evaluacion.puede_ser_evaluado_por(evaluador):
            return Response({'error': 'No tiene permisos para tomar esta evaluación'}, status=403)

        fecha_fin_str = request.data.get('fecha_fin')
        try:
            fecha_fin = datetime.strptime(fecha_fin_str, '%d-%m-%Y') 
        except (TypeError, ValueError):
            return Response({'error': 'Formato de fecha inválido. Use DD-MM-MMMM'}, status=400)

        if not fecha_fin:
            return Response({'error': 'Debe enviar una fecha de fin'}, status=400)
        evaluacion.evaluador = evaluador
        evaluacion.fecha_fin = fecha_fin
        evaluacion.estado = 'en proceso'
        evaluacion.save()
        return Response({'mensaje': 'Evaluación aceptada, puede comenzar a completarla'})

    @action(detail=False, methods=['get'], url_path='evaluaciones-finalizadas-de-un-empleado')
    def finalizadas_de_un_empleado(self, request):
        try:
            empleado = Empleado.objects.get(user_id=request.user)
        except empleado.DoesNotExist:
            return Response({'error': 'Empleado no encontrado'}, status=404)
        evaluaciones = Evaluacion.objects.filter(
            evaluado=empleado,
            estado='completada',
            empresa=empleado.empresa
        )      
        serializer = self.get_serializer(evaluaciones, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='evaluaciones-finalizadas')
    def finalizadas(self, request):
        try:
            empleado = Empleado.objects.get(user_id=request.user)
        except empleado.DoesNotExist:
            return Response({'error': 'Empleado no encontrado'}, status=404)
        evaluaciones = Evaluacion.objects.filter(
            estado='completada',
            empresa = empleado.empresa
        )       
        serializer = self.get_serializer(evaluaciones, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='evaluacionesde-un-aprobador-en-proceso')
    def evaluaciones_en_proceso_de_un_aprobador(self, request):
        try:
            empleado = Empleado.objects.get(user_id=request.user)
        except empleado.DoesNotExist:
            return Response({'error': 'Empleado no encontrado'}, status=404)
        evaluaciones = Evaluacion.objects.filter(
            estado='en proceso',
            evaluador = empleado,
            empresa = empleado.empresa
        )
        serializer = self.get_serializer(evaluaciones, many=True)
        return Response(serializer.data)

    @extend_schema(
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "criterio_id": {"type": "integer", "description": "ID del criterio de evaluación"},
                    "puntaje": {"type": "integer", "description": "Puntaje asignado"},
                    "comentario": {"type": "string", "description": "Comentario", "nullable": True}
                },
                "required": ["criterio_id", "puntaje"]
            }
        },
        responses={200: OpenApiResponse(description="Criterio agregado correctamente", examples=[{"mensaje": "Criterio agregado correctamente"}])},
        summary="Agregar criterio a evaluación"
    )
    @action(detail=True, methods=['post'], url_path='agregar-criterio')
    def agregar_criterio(self, request, pk=None):
        try:
            evaluacion = self.get_object()
            evaluador = Empleado.objects.get(user_id=request.user)
        except:
            return Response({'error': 'Error de autenticación'}, status=404)

        if evaluacion.evaluador != evaluador:
            return Response({'error': 'No tiene permiso para modificar esta evaluación'}, status=403)

        criterio_id = request.data.get('criterio_id')
        puntaje = request.data.get('puntaje')
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


    def evaluacionesProgramadas():
        hoy = timezone.now().date()
        for contrato in Contrato.objects.filter(estado='activo', evaluacion_periodicidad__isnull=False):
            ultima = contrato.ultima_evaluacion_programada or contrato.fecha_inicio
            if hoy >= (ultima + contrato.evaluacion_periodicidad):
                ya_existe = Evaluacion.objects.filter(
                    evaluado=contrato.empleado,
                    empresa=contrato.empresa,
                    estado__in=['pendiente', 'en proceso']
                ).exists()
                if not ya_existe:
                    evaluacion = Evaluacion.objects.create(
                        motivo='Evaluacion programada por contrato',
                        evaluado=contrato.empleado,
                        estado='pendiente',
                        empresa=contrato.empresa
                    )
                    contrato.ultima_evaluacion_programada = hoy
                    contrato.save()
                    aprobadores = Aprobadores.objects.filter(
                        departamento=contrato.cargo_departamento.id_departamento,
                        encargado_de='evaluacion',
                        empresa=contrato.empresa
                    )
                    url_base = settings.FRONTEND_URL
        
                    for aprobador in aprobadores:
                        Notificacion.objects.create(
                            empleado = aprobador.empleado,
                            titulo='Evaluación periódica pendiente',
                            mensaje=(
                                f'Se ha programado automáticamente una evaluación para '
                                f'{contrato.empleado.nombre} {contrato.empleado.apellidos} según su contrato.\n'
                                f'Por favor, asigne un evaluador o acepte esta evaluación.'
                                f'Esta evaluación fue generada por el sistema cada {contrato.evaluacion_periodicidad.days} días.'
                            ),
                            url = f"{url_base}/evaluaciones/{evaluacion.id}/aceptar",
                            empresa = contrato.empresa
                        )
            
            
            
            

    @extend_schema(
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "comentario_general": {"type": "string", "description": "Comentario general", "nullable": True}
                }
            }
        },
        responses={200: OpenApiResponse(description="Evaluación completada exitosamente", examples=[{"mensaje": "Evaluación completada exitosamente"}])},
        summary="Finalizar evaluación"
    )
    @action(detail=True, methods=['patch'], url_path='finalizar')
    def finalizar_evaluacion(self, request, pk=None):
        try:
            evaluacion = self.get_object()
            evaluador = Empleado.objects.get(user_id=request.user)
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
            evaluador = Empleado.objects.get(user_id=self.request.user)
        except Empleado.DoesNotExist:
            raise PermissionDenied("Empleado no válido.")

        evaluacion = serializer.validated_data.get('evaluacion')

        if evaluacion.evaluador != evaluador:
            raise PermissionDenied("No puede agregar criterios a esta evaluación.")
        serializer.save(empresa=self.request.user.empresa)