from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.cargo.models import Cargo
from apps.cargo.serializers import CargoSerializer


# Create your views here.

class CargoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CargoSerializer

    def get_queryset(self):
        return Cargo.objects.filter(empresa=self.request.user.empresa)
    
    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)
