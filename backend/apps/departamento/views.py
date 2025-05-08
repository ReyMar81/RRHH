from rest_framework import viewsets
from .models import Departamento
from .serializer import DepartamentoSerializers
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class DepartamentoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Departamento.objects.all()
    serializer_class = DepartamentoSerializers