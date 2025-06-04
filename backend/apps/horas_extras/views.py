from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.horas_extras.models import HorasExtras
from apps.horas_extras.serializers import HorasExtrasSerializer


# Create your views here.

class HorasExtrasViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = HorasExtrasSerializer
    
    def get_queryset(self):
        return HorasExtras.objects.filter(empresa=self.request.user.empresa)

    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)
