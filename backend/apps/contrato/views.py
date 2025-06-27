from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.contrato.models import Contrato
from apps.contrato.serializers import ContratoSerializer


# Create your views here.

class ContratoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ContratoSerializer

    def get_queryset(self):
        qs = Contrato.objects.filter(empresa=self.request.user.empresa)
        empleado_id = self.request.query_params.get('empleado')
        if empleado_id:
            qs = qs.filter(empleado_id=empleado_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)