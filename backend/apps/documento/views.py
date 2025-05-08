from rest_framework import viewsets
from .models import Documento
from .serializer import DocumentoSerializers
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class DocumentoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializers
