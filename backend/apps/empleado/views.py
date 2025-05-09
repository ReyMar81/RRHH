from rest_framework import viewsets, status
from .models import Empleado
from .serializer import CambiarPasswordConValidacionSerializer, EmpleadoSerializers
from rest_framework.permissions import IsAuthenticated
from .service import cambiar_password_con_validacion, crear_empleado_con_usuario
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
        request=CambiarPasswordConValidacionSerializer,
        responses={
            200: None,
            400: {"error": "Contraseña actual incorrecta"},
            404: {"error": "Empleado no encontrado"}
        },
        description="Permite al empleado cambiar su contraseña validando la actual"
    )
    def put(self, request, empleado_id):
        serializer = CambiarPasswordConValidacionSerializer(data=request.data)
        if serializer.is_valid():
            actual = serializer.validated_data['actual_password']
            nueva = serializer.validated_data['nueva_password']

            exito, mensaje = cambiar_password_con_validacion(empleado_id, actual, nueva)

            if exito:
                return Response({'mensaje': mensaje}, status=status.HTTP_200_OK)
            return Response({'error': mensaje}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)