from rest_framework import viewsets
from .models import EstructuraSalarial, ReglaSalarial, BoletaPago, DetalleBoletaPago
from .serializers import EstructuraSalarialSerializer, ReglaSalarialSerializer, BoletaPagoSerializer, DetalleBoletaPagoSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.nomina.service import generar_nomina_masiva, generar_nomina_manual
from apps.empresas.models import Empresa
from apps.empleado.models import Empleado
from datetime import datetime

class EstructuraSalarialViewSet(viewsets.ModelViewSet):
    queryset = EstructuraSalarial.objects.all()
    serializer_class = EstructuraSalarialSerializer

class ReglaSalarialViewSet(viewsets.ModelViewSet):
    queryset = ReglaSalarial.objects.all()
    serializer_class = ReglaSalarialSerializer

class BoletaPagoViewSet(viewsets.ModelViewSet):
    queryset = BoletaPago.objects.all()
    serializer_class = BoletaPagoSerializer

class DetalleBoletaPagoViewSet(viewsets.ModelViewSet):
    queryset = DetalleBoletaPago.objects.all()
    serializer_class = DetalleBoletaPagoSerializer

class GenerarNominaMasivaView(APIView):
    def post(self, request):
        empresa_id = request.data.get('empresa_id')
        fecha_inicio = request.data.get('fecha_inicio')
        fecha_fin = request.data.get('fecha_fin')
        cierre_fin_de_mes = request.data.get('cierre_fin_de_mes', False)
        empresa = get_object_or_404(Empresa, id=empresa_id)
        fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
        if fecha_fin:
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
        else:
            fecha_fin = None
        boletas = generar_nomina_masiva(empresa, fecha_inicio, fecha_fin, cierre_fin_de_mes)
        return Response({'boletas_generadas': len(boletas)}, status=status.HTTP_201_CREATED)

class GenerarNominaManualView(APIView):
    def post(self, request):
        empresa_id = request.data.get('empresa_id')
        empleado_id = request.data.get('empleado_id')
        fecha_inicio = request.data.get('fecha_inicio')
        fecha_fin = request.data.get('fecha_fin')
        cierre_fin_de_mes = request.data.get('cierre_fin_de_mes', False)
        empresa = get_object_or_404(Empresa, id=empresa_id)
        empleado = get_object_or_404(Empleado, id=empleado_id)
        fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
        if fecha_fin:
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
        else:
            fecha_fin = None
        payslip = generar_nomina_manual(empleado, empresa, fecha_inicio, fecha_fin, cierre_fin_de_mes)
        if payslip:
            return Response({'boleta_pago_id': payslip.id}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': 'No se pudo generar la nómina para el empleado.'}, status=status.HTTP_400_BAD_REQUEST)

# Vistas para la lógica de nómina irán aquí
