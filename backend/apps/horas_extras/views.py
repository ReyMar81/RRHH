from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.horas_extras.models import HorasExtras, AprobadoresDeHorasExtra
from apps.horas_extras.serializers import HorasExtrasSerializer, AprobadoresDeHorasExtraSereializer
from apps.empleado.models import Empleado
from apps.contrato.models import Contrato
from apps.noticacion.models import Notificacion
from datetime import timedelta
from rrhh import settings
from datetime import timezone


# Create your views here.

class HorasExtrasViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = HorasExtrasSerializer
    
    def get_queryset(self):
        return HorasExtras.objects.filter(empresa=self.request.user.empresa)

    @action(detail=False, methods=['post'], url_path='solicitar')
    def solicitar_horas_extra(self, request):
        try:
            empleado = Empleado.objects.get(user=request.user)
        except Empleado.DoesNotExist:
            return Response({'error': 'Empleado no registrado'}, status=404)
        horas_solicitadas = request.data.get('horas_solicitadas')
        if not horas_solicitadas:
            return Response({'error': 'Debe indicar cuántas horas desea solicitar'}, status=400)
        try:
            duracion = strAHoras(horas_solicitadas)
            if duracion.total_seconds() <= 0:
                return Response({'error': 'Duración debe ser mayor a 0'}, status=400)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        
        motivo = request.data.get('motivo')
        
        registro = HorasExtras.objects.create(
            cantidad_horas_extra_solicitadas=duracion,
            estado="IMPAGO",
            motivo=motivo,
            empleado_solicitador=empleado,
            empresa=empleado.empresa
        )
        
        contrato = Contrato.objects.filter(empleado=empleado, estado='ACTIVO').select_related('cargo_departamento__id_departamento').first()
        if not contrato:
            return Response({'error': 'Contrato activo no encontrado'}, status=404)
        departamento = contrato.cargo_departamento.id_departamento
        aprobadores = AprobadoresDeHorasExtra.objects.filter(departamento=departamento)
        
        url_base = settings.FRONTEND_URL
        
        for aprobador in aprobadores:
            Notificacion.objects.create(
                user = aprobador.empleado.user_id,
                titulo='Solicitud de horas extra',
                mensaje=f'{empleado.nombre} {empleado.apellidos} solicitó {horas_solicitadas} horas extra',
                url = f'{url_base}/horas-extra/{registro.id}/responder"', #!  CAMBIAR A URL DONDE SE APRUEBE LA SOLICITUD
                empresa = empleado.empresa
            )
        
        return Response({'mensaje': 'Solicitud registrada correctamente'}, status=201)

    @action(detail=False, methods=['get'], url_path='pendientes-aprobar')
    def pendientes_aprobar(self, request):
        try:
            aprobador = Empleado.objects.get(user=request.user)
        except Empleado.DoesNotExist:
            return Response({'error': 'Empleado no encontrado'}, status=404)
        departamento_aprobador = aprobador.departamento_del_empleado()
        solicitudes = HorasExtras.objects.filter(
            aprobado__isnull = True,
            empleado_autorizador__isnull = True
        )
        solicitudes_filtradas = [
            s for s in solicitudes
            if s.empleado_solicitador.departamento_del_empleado() == departamento_aprobador
        ]
        
        serializer = HorasExtrasSerializer(solicitudes_filtradas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='responder')
    def responder_solicitud(self, request, pk=None):
        try:
            solicitud = self.get_object()
            aprobador = Empleado.objects.get(user=request.user)
        except:
            return Response({'error': 'Error localizando solicitud o empleado'}, status=404)
        
        if not solicitud.puede_ser_aprobada_por(aprobador):
            return Response({'error': 'No tiene permisos para aprobar esta solicitud'}, status=403)
    
        accion = request.data.get('accion')  # 'aprobar' o 'rechazar'
        if accion not in ['aprobar', 'rechazar']:
            return Response({'error': 'Acción inválida'}, status=400)
        
        solicitud.aprobado = True if accion == 'aprobar' else False
        solicitud.empleado_autorizador = aprobador
        solicitud.fecha_autorizacion = timezone.now()
        solicitud.save()
        
        Notificacion.objects.create(
    user=solicitud.empleado_solicitador.user_id,
    titulo='Respuesta a tu solicitud de horas extra',
    mensaje=(
        f'Tu solicitud de {solicitud.cantidad_horas_extra_solicitadas} horas extra '
        f'ha sido {"aprobada" if solicitud.aprobado else "rechazada"} por {aprobador.nombre} {aprobador.apellidos}.'
    ),
    empresa=solicitud.empresa
)
    
class AprobadoresDeHorasExtraViewSet(viewsets.ModelViewSet):
    serializer_class = AprobadoresDeHorasExtraSereializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return  AprobadoresDeHorasExtra.objects.filter(empresa=self.request.user.empresa)
    
    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)
        
def strAHoras(horas:str):
    try:
        partes= horas.strip().split(':')
        hora = int(partes[0])
        mint = int(partes[1]) if len(partes) > 1 else 0
        return timedelta(hours=hora, minutes=mint)
    except:
        raise ValueError('Formato invalido, debe ser HH:MM')     