from rest_framework import serializers
from .models import EstructuraSalarial, ReglaSalarial, BoletaPago, DetalleBoletaPago

class ReglaSalarialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReglaSalarial
        fields = '__all__'

class EstructuraSalarialSerializer(serializers.ModelSerializer):
    reglas = ReglaSalarialSerializer(many=True, read_only=True)
    class Meta:
        model = EstructuraSalarial
        fields = '__all__'

class DetalleBoletaPagoSerializer(serializers.ModelSerializer):
    regla = ReglaSalarialSerializer(read_only=True)
    class Meta:
        model = DetalleBoletaPago
        fields = '__all__'

class BoletaPagoSerializer(serializers.ModelSerializer):
    detalles = DetalleBoletaPagoSerializer(many=True, read_only=True)
    estructura = EstructuraSalarialSerializer(read_only=True)
    class Meta:
        model = BoletaPago
        fields = '__all__'

class GenerarNominaManualSerializer(serializers.Serializer):
    empresa_id = serializers.IntegerField()
    empleado_id = serializers.IntegerField()
    fecha_inicio = serializers.DateField()
    fecha_fin = serializers.DateField(required=False)
    cierre_fin_de_mes = serializers.BooleanField(required=False, default=False)
