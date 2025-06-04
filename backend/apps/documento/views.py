from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Documento
from .serializer import DocumentoSerializers
from apps.empleado.models import Empleado

class DocumentoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentoSerializers
    
    def get_queryset(self):
        return Documento.objects.filter(empresa=self.request.user.empresa)
    
    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)


    @action(detail=False, methods=['get'], url_path='mios')
    def mis_documentos(self, request):
        try:
            empleado = Empleado.objects.filter(user_id=request.user,empresa=request.user.empresa).first()
            if not empleado:
                return Response({'error': 'Empleado no encontrado'}, status=404)

            documentos = Documento.objects.filter(empleado_id=empleado).order_by('-fecha_subida')
            serializer = self.get_serializer(documentos, many=True)
            return Response(serializer.data)

        except Exception as e:
            return Response({'error': str(e)}, status=500)
