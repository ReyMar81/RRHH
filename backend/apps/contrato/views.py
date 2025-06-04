from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.contrato.models import Contrato
from apps.contrato.serializers import ContratoSerializer


# Create your views here.

class ContratoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ContratoSerializer

    def get_queryset(self):
        return Contrato.objects.filter(empresa=self.request.user.empresa)

    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)