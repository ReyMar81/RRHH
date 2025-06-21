from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.horas_extras.models import HorasExtras, AprobadoresDeHorasExtra
from apps.horas_extras.serializers import HorasExtrasSerializer
from apps.empleado.models import Empleado
from apps.contrato.models import Contrato
from datetime import timedelta


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
        
        HorasExtras.objects.create(
            cantidad_horas_extra_solicitadas=duracion,
            estado="IMPAGO",
            motivo=motivo,
            empleado_solicitador=empleado,
            empresa=empleado.empresa
        )
        
        departamento = Contrato.objects.get(empleado=empleado).cargo_departamento.id_departamento
        aprobador = AprobadoresDeHorasExtra.objects.filter(departamento=departamento)
        
        return Response({'mensaje': 'Solicitud registrada correctamente'}, status=201)

               
    
class AprobadoresDeHorasExtraViewSet(viewsets.ModelViewSet):
    
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