from rest_framework.viewsets import ModelViewSet
from .models import Tipo
from .serializers import TipoSerializer

class TipoViewSet(ModelViewSet):
    queryset = Tipo.objects.all()
    serializer_class = TipoSerializer
