from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from .models import Plan, Suscripcion,  Planes_Privilegios
from .serializers import PlanSerializer, SuscripcionSerializer, PlanesPrivilegiosSerializer

class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    permission_classes = [AllowAny]

class SuscripcionViewSet(viewsets.ModelViewSet):
    queryset = Suscripcion.objects.all()
    serializer_class = SuscripcionSerializer
    permission_classes = [IsAdminUser]

class PlanesPrivilegiosViewSet(viewsets.ModelViewSet):
    queryset = Planes_Privilegios.objects.all()
    serializer_class = PlanesPrivilegiosSerializer
    permission_classes = [IsAdminUser]
