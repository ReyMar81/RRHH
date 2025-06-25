from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.views import APIView
from apps.cargo_departamento.models import CargoDepartamento
from apps.cargo.serializers import CargoSerializer
from .models import Departamento
from .serializer import DepartamentoSerializers, EmpleadoEstadoAsistenciaSerializer
from rest_framework.permissions import IsAuthenticated
from apps.contrato.models import Contrato
from apps.asistencia.models import Asistencia
from datetime import date
# Create your views here.

class DepartamentoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DepartamentoSerializers
    
    def get_queryset(self):
        return Departamento.objects.filter(empresa=self.request.user.empresa)
    
    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)

class CargosPorDepartamentoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            departamento = Departamento.objects.get(pk=id,empresa=request.user.empresa) ##!AUMENTE ESTO
            relaciones = CargoDepartamento.objects.select_related('id_cargo').filter(id_departamento=departamento)
            cargos = [rel.id_cargo for rel in relaciones]
            serializer = CargoSerializer(cargos, many=True)
            return Response(serializer.data)
        except Departamento.DoesNotExist:
            return Response({'error': 'Departamento no encontrado'}, status=404)

class EmpleadosActivosPorDepartamentoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            departamento = Departamento.objects.get(pk=id,empresa=request.user.empresa) ##!Aumente esto
            relaciones = CargoDepartamento.objects.filter(id_departamento=departamento)
            
            contratos = Contrato.objects.select_related(
                'empleado', 'cargo_departamento__id_cargo'
            ).filter(cargo_departamento__in=relaciones, estado='ACTIVO')

            hoy = date.today()
            datos = []
            for contrato in contratos:
                empleado = contrato.empleado
                cargo = contrato.cargo_departamento.id_cargo

                # Verificar si tiene asistencia hoy
                asistencia = Asistencia.objects.filter(empleado=empleado, fecha=hoy).first()
                if not asistencia:
                    estado_asistencia = "Ausente"
                elif asistencia.hora_salida is None:
                    estado_asistencia = "Presente"
                else:
                    estado_asistencia = "Jornada completada"

                datos.append({
                    'id': empleado.id,
                    'nombre_completo': f"{empleado.nombre} {empleado.apellidos}",
                    'cargo': cargo.nombre,
                    'estado': estado_asistencia
                })

            serializer = EmpleadoEstadoAsistenciaSerializer(datos, many=True)
            return Response(serializer.data)

        except Departamento.DoesNotExist:
            return Response({'error': 'Departamento no encontrado'}, status=404)
