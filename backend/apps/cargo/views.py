from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.cargo.models import Cargo
from apps.cargo.serializers import CargoSerializer


# Create your views here.

class CargoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer