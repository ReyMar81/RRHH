from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.contrato.models import Contrato
from apps.contrato.serializers import ContratoSerializer


# Create your views here.

class ContratoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Contrato.objects.all()
    serializer_class = ContratoSerializer
