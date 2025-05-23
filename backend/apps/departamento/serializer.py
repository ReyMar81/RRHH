from rest_framework import serializers
from .models import Departamento

class SubDepartamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departamento
        fields = ['id', 'nombre', 'descripcion']

class DepartamentoSerializers(serializers.ModelSerializer):
    subdepartamentos = SubDepartamentoSerializer(many=True, read_only=True)

    class Meta:
        model = Departamento
        fields = '__all__'

class EmpleadoEstadoAsistenciaSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre_completo = serializers.CharField()
    cargo = serializers.CharField()
    estado = serializers.CharField()
