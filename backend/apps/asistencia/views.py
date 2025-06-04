from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.contrato.models import Contrato
from .models import Asistencia
from .serializer import AsistenciaSerializer
from apps.empleado.models import Empleado
from datetime import datetime, timedelta

class RegistroAsistenciaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        try:
            empleado = Empleado.objects.get(user_id=request.user)
            
            contrato = Contrato.objects.select_related(
                'cargo_departamento', 'cargo_departamento__id_cargo'
            ).filter(empleado=empleado, estado='ACTIVO').first()

            if not contrato:
                return Response({'error': 'Empleado no tiene contrato activo'}, status=status.HTTP_404_NOT_FOUND)

            cargo = contrato.cargo_departamento.id_cargo
            hoy = datetime.today().date()
            ahora = datetime.now().time()

            asistencia, creada = Asistencia.objects.get_or_create(
                empleado=empleado,
                fecha=hoy,
                defaults={
                    'hora_entrada': ahora,
                    'empresa': empleado.empresa    #Auemnte
                }
            )

            if not creada:
                if asistencia.hora_salida is not None:
                    return Response({'mensaje': 'Ya se registró entrada y salida para hoy'}, status=status.HTTP_400_BAD_REQUEST)

                asistencia.hora_salida = ahora

                # Calcular horas trabajadas
                entrada_dt = datetime.combine(hoy, asistencia.hora_entrada)
                salida_dt = datetime.combine(hoy, ahora)
                total_horas = (salida_dt - entrada_dt).total_seconds() / 3600
                receso = float(cargo.receso_diario or 0)
                asistencia.horas_trabajadas = Decimal(total_horas - receso)

                # Observaciones
                obs = []
                tolerancia_retraso = timedelta(minutes=15)
                if asistencia.hora_entrada > (datetime.combine(hoy, cargo.horario_inicio) + tolerancia_retraso).time():
                    obs.append("Retraso")
                if asistencia.hora_salida > cargo.horario_fin:
                    obs.append("Salida después del horario")
                if not obs:
                    obs.append("Puntual")

                asistencia.observaciones = " / ".join(obs)
                asistencia.save()

                return Response({'mensaje': 'Salida registrada correctamente'}, status=status.HTTP_200_OK)

            return Response({'mensaje': 'Entrada registrada correctamente'}, status=status.HTTP_201_CREATED)

        except Empleado.DoesNotExist:
            return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class AsistenciaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Asistencia.objects.all().order_by('-fecha')
    serializer_class = AsistenciaSerializer
    permission_classes = [IsAuthenticated]


    ##!! FIJARSE EN ENTE SI FUCIONA LE HICE MODIFICACIONES
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Asistencia.objects.filter(empresa=user.empresa)
        return Asistencia.objects.filter(empleado__user=user, empresa=user.empresa)

class MisAsistenciasAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            empleado = Empleado.objects.get(user_id=request.user)
            asistencias = Asistencia.objects.filter(empleado=empleado).order_by('-fecha')
            serializer = AsistenciaSerializer(asistencias, many=True)
            return Response(serializer.data)
        except Empleado.DoesNotExist:
            return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class EstadoAsistenciaAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            empleado = Empleado.objects.get(user_id=request.user.id)
            hoy = datetime.today().date()

            asistencia = Asistencia.objects.filter(empleado=empleado, fecha=hoy).first()

            if asistencia:
                ya_marco_salida = asistencia.hora_salida is not None
                return Response({
                    'yaMarcoSalida': ya_marco_salida,
                    'mensaje': 'Ya finalizó su jornada hoy' if ya_marco_salida else 'Puede registrar su salida'
                })

            return Response({
                'yaMarcoSalida': False,
                'mensaje': 'Puede registrar su entrada'
            })

        except Empleado.DoesNotExist:
            return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)
