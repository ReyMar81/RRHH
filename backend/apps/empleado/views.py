from rest_framework import viewsets, status
from .models import Empleado
from .serializer import EmpleadoSerializers
from rest_framework.permissions import IsAuthenticated
from .service import crear_empleado_con_usuario
from rest_framework.response import Response

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