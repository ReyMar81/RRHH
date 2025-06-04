from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.contrib.auth.models import Group, Permission
from security.group_serializers import GroupSerializer, PermissionSerializer
from apps.suscripciones.models import Planes_Privilegios
from apps.empresas.models import Empresa
from security.models import Usuario

class IsEmpresaAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff and request.user.empresa is not None

class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [IsEmpresaAdmin]

    def get_queryset(self):
        # Solo los grupos creados por la empresa (usando prefijo en el nombre)
        empresa = self.request.user.empresa
        return Group.objects.filter(name__startswith=f"empresa_{empresa.id}_")

    def perform_create(self, serializer):
        empresa = self.request.user.empresa
        name = serializer.validated_data['name']
        serializer.save(name=f"empresa_{empresa.id}_{name}")

class EmpresaPermissionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PermissionSerializer
    permission_classes = [IsEmpresaAdmin]

    def get_queryset(self):
        empresa = self.request.user.empresa
        # Obtener el plan activo de la empresa
        plan = getattr(empresa.suscripcion_set.order_by('-fecha_creacion').first(), 'plan', None)
        if not plan:
            return Permission.objects.none()
        privilegios = Planes_Privilegios.objects.filter(plan=plan).values_list('privilegio_id', flat=True)
        return Permission.objects.filter(id__in=privilegios)
