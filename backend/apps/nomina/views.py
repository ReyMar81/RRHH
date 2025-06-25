from rest_framework import viewsets
from .models import EstructuraSalarial, ReglaSalarial, BoletaPago, DetalleBoletaPago
from .serializers import EstructuraSalarialSerializer, ReglaSalarialSerializer, BoletaPagoSerializer, DetalleBoletaPagoSerializer, GenerarNominaManualSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.nomina.service import generar_nomina_masiva, generar_nomina_manual
from apps.empresas.models import Empresa
from apps.empleado.models import Empleado
from datetime import datetime
from drf_spectacular.utils import extend_schema, OpenApiExample
from apps.plantillas_nomina.models import EstructuraSalarialPlantilla, ReglaSalarialPlantilla, Pais
from .serializers_clonacion import ClonarEstructuraPlantillaSerializer
from rest_framework import serializers
from .serializers_pais import PaisSerializer

class EstructuraSalarialViewSet(viewsets.ModelViewSet):
    queryset = EstructuraSalarial.objects.all()
    serializer_class = EstructuraSalarialSerializer

class ReglaSalarialViewSet(viewsets.ModelViewSet):
    queryset = ReglaSalarial.objects.all()
    serializer_class = ReglaSalarialSerializer

class BoletaPagoViewSet(viewsets.ModelViewSet):
    queryset = BoletaPago.objects.all()
    serializer_class = BoletaPagoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        empleado_id = self.request.query_params.get('empleado')
        empresa_id = self.request.query_params.get('empresa')
        if empleado_id:
            queryset = queryset.filter(empleado_id=empleado_id)
        if empresa_id:
            queryset = queryset.filter(empresa_id=empresa_id)
        return queryset

class DetalleBoletaPagoViewSet(viewsets.ModelViewSet):
    queryset = DetalleBoletaPago.objects.all()
    serializer_class = DetalleBoletaPagoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        boleta_id = self.request.query_params.get('boleta')
        if boleta_id:
            queryset = queryset.filter(boleta_id=boleta_id)
        return queryset

class GenerarNominaMasivaSerializer(serializers.Serializer):
    empresa_id = serializers.IntegerField()
    fecha_inicio = serializers.DateField()
    fecha_fin = serializers.DateField(required=False)
    cierre_fin_de_mes = serializers.BooleanField(required=False)

@extend_schema(
    request=GenerarNominaMasivaSerializer,
    responses={201: OpenApiExample(
        'Respuesta exitosa',
        value={
            "boletas_generadas": 5,
            "boletas": [
                {
                    "id": 1,
                    "empleado": 2,
                    "total_neto": "380.00",
                    "estado": "validada"
                },
                {
                    "id": 2,
                    "empleado": 3,
                    "total_neto": "450.00",
                    "estado": "validada"
                }
            ]
        },
        response_only=True
    )},
    examples=[
        OpenApiExample(
            'Ejemplo de generación masiva',
            value={
                "empresa_id": 1,
                "fecha_inicio": "2025-06-01",
                "fecha_fin": "2025-06-30",
                "cierre_fin_de_mes": False
            },
            request_only=True
        )
    ],
    description="Genera la nómina de todos los empleados activos de la empresa para el periodo dado."
)
class GenerarNominaMasivaView(APIView):
    def post(self, request):
        serializer = GenerarNominaMasivaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        empresa_id = serializer.validated_data['empresa_id']
        fecha_inicio = serializer.validated_data['fecha_inicio']
        fecha_fin = serializer.validated_data.get('fecha_fin')
        cierre_fin_de_mes = serializer.validated_data.get('cierre_fin_de_mes', False)
        empresa = get_object_or_404(Empresa, id=empresa_id)
        boletas = generar_nomina_masiva(empresa, fecha_inicio, fecha_fin, cierre_fin_de_mes)
        boletas_data = [
            {
                "id": b.id,
                "empleado": b.empleado.id if hasattr(b.empleado, 'id') else b.empleado,
                "total_neto": str(b.total_neto),
                "estado": b.estado
            }
            for b in boletas
        ]
        return Response({
            'boletas_generadas': len(boletas),
            'boletas': boletas_data
        }, status=status.HTTP_201_CREATED)

class GenerarNominaManualView(APIView):
    @extend_schema(
        request=GenerarNominaManualSerializer,
        responses={201: BoletaPagoSerializer, 400: dict},
        description="Genera la nómina de un empleado individualmente."
    )
    def post(self, request):
        serializer = GenerarNominaManualSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        empresa_id = serializer.validated_data['empresa_id']
        empleado_id = serializer.validated_data['empleado_id']
        fecha_inicio = serializer.validated_data['fecha_inicio']
        fecha_fin = serializer.validated_data.get('fecha_fin')
        cierre_fin_de_mes = serializer.validated_data.get('cierre_fin_de_mes', False)
        empresa = get_object_or_404(Empresa, id=empresa_id)
        empleado = get_object_or_404(Empleado, id=empleado_id)
        payslip = generar_nomina_manual(empleado, empresa, fecha_inicio, fecha_fin, cierre_fin_de_mes)
        if payslip == 'EXISTE':
            return Response({'error': 'Ya existe una boleta para este empleado y periodo.'}, status=status.HTTP_400_BAD_REQUEST)
        if payslip:
            return Response(payslip, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': 'No se pudo generar la nómina para el empleado.'}, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    request=ClonarEstructuraPlantillaSerializer,
    responses={201: OpenApiExample(
        'Respuesta exitosa',
        value={
            "estructuras_clonadas": 5,
            "ids": [1, 2, 3, 4, 5]
        },
        response_only=True
    )},
    examples=[
        OpenApiExample(
            'Ejemplo de clonación por país',
            value={
                "empresa_id": 1,
                "pais_id": 2
            },
            request_only=True
        )
    ],
    description="Clona todas las estructuras plantilla y sus reglas de un país a la empresa seleccionada."
)
class ClonarEstructuraPlantillaView(APIView):
    """
    Clona todas las estructuras plantilla y sus reglas de un país a la empresa seleccionada.
    """
    def post(self, request):
        serializer = ClonarEstructuraPlantillaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        empresa_id = serializer.validated_data['empresa_id']
        pais_id = serializer.validated_data['pais_id']
        empresa = get_object_or_404(Empresa, id=empresa_id)
        pais = get_object_or_404(Pais, id=pais_id)
        estructuras_plantilla = EstructuraSalarialPlantilla.objects.filter(pais=pais)
        if not estructuras_plantilla.exists():
            return Response({'error': 'No hay estructuras plantilla para este país.'}, status=status.HTTP_400_BAD_REQUEST)
        ids = []
        for plantilla in estructuras_plantilla:
            estructura = EstructuraSalarial.objects.create(
                nombre=plantilla.nombre,
                descripcion=plantilla.descripcion,
                empresa=empresa,
                tipo_contrato=plantilla.tipo_contrato,
                pais=pais.nombre,
                activa=True
            )
            reglas_plantilla = ReglaSalarialPlantilla.objects.filter(estructura=plantilla)
            for regla in reglas_plantilla:
                ReglaSalarial.objects.create(
                    estructura=estructura,
                    nombre=regla.nombre,
                    codigo=regla.codigo,
                    tipo=regla.tipo,
                    secuencia=regla.secuencia,
                    condicion=regla.condicion,
                    formula=regla.formula,
                    empresa=empresa,
                    pais=pais.nombre
                )
            ids.append(estructura.id)
        return Response({'estructuras_clonadas': len(ids), 'ids': ids}, status=status.HTTP_201_CREATED)

class PaisListView(APIView):
    def get(self, request):
        paises = Pais.objects.all()
        serializer = PaisSerializer(paises, many=True)
        return Response(serializer.data)

class BoletasPorEmpleadoView(APIView):
    def get(self, request, empleado_id):
        boletas = BoletaPago.objects.filter(empleado_id=empleado_id).order_by('-fecha_inicio')
        data = [
            {
                'id': b.id,
                'fecha_inicio': b.fecha_inicio,
                'fecha_fin': b.fecha_fin,
                'total_neto': b.total_neto,
                'total_ingresos': b.total_ingresos,
                'total_deducciones': b.total_deducciones,
                'estado': b.estado,
                'modo_generacion': b.modo_generacion,
                'detalles': [
                    {
                        'nombre': d.nombre,
                        'codigo': d.codigo,
                        'tipo': d.tipo,
                        'monto': d.monto,
                        'secuencia': d.secuencia
                    } for d in b.detalles.all()
                ]
            }
            for b in boletas
        ]
        return Response(data)

# Vistas para la lógica de nómina irán aquí
