from rest_framework import viewsets
from .models import Documento
from .serializer import DocumentoSerializers

# Create your views here.

class DocumentoViewSet(viewsets.ModelViewSet):
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializers
