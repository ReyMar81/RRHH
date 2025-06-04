from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import Group
from security.models import Usuario
from security.usuario_rol_serializers import UsuarioRolSerializer

class AsignarRolUsuarioView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = UsuarioRolSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.validated_data['usuario_id']
            group = serializer.validated_data['group_id']
            # Solo permitir asignar grupos de la empresa del usuario autenticado
            empresa = request.user.empresa
            if not group.name.startswith(f"empresa_{empresa.id}_"):
                return Response({'error': 'No puede asignar roles de otra empresa.'}, status=status.HTTP_403_FORBIDDEN)
            if usuario.empresa != empresa:
                return Response({'error': 'Solo puede asignar roles a usuarios de su empresa.'}, status=status.HTTP_403_FORBIDDEN)
            usuario.groups.clear()
            usuario.groups.add(group)
            return Response({'mensaje': 'Rol asignado correctamente.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
