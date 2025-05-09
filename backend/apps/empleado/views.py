from rest_framework import viewsets, status
from .models import Empleado
from .serializer import CambiarPasswordEmpleadoSerializer, EmpleadoSerializers
from rest_framework.permissions import IsAuthenticated
from .service import cambiar_password_empleado, crear_empleado_con_usuario
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

# Create your views here.

class EmpleadoViewSets(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializers

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        empleado, username, password = crear_empleado_con_usuario(serializer.validated_data)

        response_data = self.get_serializer(empleado).data
        response_data.update({'username': username, 'password': password})
        return Response(response_data, status=status.HTTP_201_CREATED)
    
class CambiarPasswordEmpleadoView(APIView):
    @extend_schema(
        request=CambiarPasswordEmpleadoSerializer,
        responses={200: None, 400: {"error": "Se requiere nueva_password"}, 404: {"error": "Empleado no encontrado"}},
        description="Cambia la contraseña de un empleado"
    )
    def put(self, request, empleado_id):
        nueva_password = request.data.get('nueva_password')

        if not nueva_password:
            return Response({'error': 'Se requiere nueva_password'}, status=status.HTTP_400_BAD_REQUEST)

        exito, mensaje = cambiar_password_empleado(empleado_id, nueva_password)
        if exito:
            return Response({'mensaje': mensaje}, status=status.HTTP_200_OK)
        else:
            return Response({'error': mensaje}, status=status.HTTP_404_NOT_FOUND)