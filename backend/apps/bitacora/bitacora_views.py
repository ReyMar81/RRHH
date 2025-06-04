from rest_framework import viewsets, permissions
from apps.bitacora.models import Bitacora
from apps.bitacora.serializers import BitacoraSerializer

class IsEmpresaUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, "empresa") and request.user.empresa is not None

class BitacoraViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BitacoraSerializer
    permission_classes = [IsEmpresaUser]

    def get_queryset(self):
        empresa = self.request.user.empresa
        return Bitacora.objects.select_related('usuario', 'empresa').filter(empresa=empresa)
