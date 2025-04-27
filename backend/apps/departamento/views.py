from rest_framework import viewsets
from .models import Departamento
from .serializer import DepartamentoSerializers

# Create your views here.

class DepartamentoViewSet(viewsets.ModelViewSet):
    queryset = Departamento.objects.all()
    serializer_class = DepartamentoSerializers