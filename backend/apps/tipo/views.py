from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .models import Tipo
from .serializers import TipoSerializer

class TipoViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TipoSerializer

    def get_queryset(self):
        return Tipo.objects.filter(empresa=self.request.user.empresa)

    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)
