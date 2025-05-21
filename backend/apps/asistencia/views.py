from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.asistencia.models import Asistencia
from apps.asistencia.serializers import AsistenciaSerializer


# Create your views here.

class AsistenciViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Asistencia.objects.all()
    serializer_class = AsistenciaSerializer