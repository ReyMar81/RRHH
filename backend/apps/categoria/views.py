from rest_framework.viewsets import ModelViewSet
from .models import Categoria
from .serializers import CategoriaSerializer

class CategoriaViewSet(ModelViewSet):
    serializer_class = CategoriaSerializer

    def get_queryset(self):
        return Categoria.objects.filter(empresa=self.request.user.empresa)

    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)
