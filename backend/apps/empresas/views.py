from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from apps.empresas.models import Empresa
from apps.empresas.serializers import EmpresaSerializer, EmpresaRegistroSerializer
from apps.empresas.service import crear_empresa_con_admin

# Create your views here.
class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

class EmpresaRegistroView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=EmpresaRegistroSerializer,
        responses={201: EmpresaSerializer},
        description="Registro público de empresa y envío de credenciales al email del admin. Debe incluir el campo plan_id si se desea un plan específico."
    )
    def post(self, request):
        serializer = EmpresaRegistroSerializer(data=request.data)
        if serializer.is_valid():
            empresa, user, password = crear_empresa_con_admin(serializer.validated_data)
            return Response({
                'empresa_id': empresa.id,
                'admin_username': user.username,
                'admin_email': user.email,
                'password': password,
                'plan_id': request.data.get('plan_id', None),
                'mensaje': 'Empresa registrada y credenciales enviadas al email.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
