from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.cargo_departamento.models import CargoDepartamento
from apps.cargo_departamento.serializers import CargoDepartamentoSerializer


# Create your views here.

class CargoDepartamentoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CargoDepartamentoSerializer
    
    def get_queryset(self):
        return CargoDepartamento.objects.filter(empresa=self.request.user.empresa)

    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)
