from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Asistencia
from .serializer import AsistenciaSerializer
from apps.empleado.models import Empleado
from datetime import datetime

class RegistroAsistenciaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        try:
            empleado = Empleado.objects.get(user_id=request.user)
            hoy = datetime.today().date()
            ahora = datetime.now().time()

            asistencia, creada = Asistencia.objects.get_or_create(
                empleado=empleado,
                fecha=hoy,
                defaults={'hora_entrada': ahora, 'observaciones': request.data.get('observaciones', '')}
            )

            if not creada:
                if asistencia.hora_salida is None:
                    asistencia.hora_salida = ahora
                    asistencia.save()
                    return Response({'mensaje': 'Salida registrada correctamente'}, status=status.HTTP_200_OK)
                else:
                    return Response({'mensaje': 'Ya se registró entrada y salida para hoy'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({'mensaje': 'Entrada registrada correctamente'}, status=status.HTTP_201_CREATED)

        except Empleado.DoesNotExist:
            return Response({'error': 'Empleado no encontrado para este usuario'}, status=status.HTTP_404_NOT_FOUND)
        
class AsistenciaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Asistencia.objects.all().order_by('-fecha')
    serializer_class = AsistenciaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:  # Administrador
            return Asistencia.objects.all().order_by('-fecha')
        else:
            return Asistencia.objects.filter(empleado__user=user).order_by('-fecha')

class MisAsistenciasAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            empleado = Empleado.objects.get(user_id=request.user)
            asistencias = Asistencia.objects.filter(empleado=empleado).order_by('-fecha')
            serializer = AsistenciaSerializer(asistencias, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Empleado.DoesNotExist:
            return Response({'error': 'Empleado no encontrado para este usuario'}, status=status.HTTP_404_NOT_FOUND)
