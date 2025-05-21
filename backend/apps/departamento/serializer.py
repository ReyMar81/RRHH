from rest_framework import serializers
from .models import Departamento

class SubDepartamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departamento
        fields = ['id', 'nombre', 'descripcion']

class DepartamentoSerializers(serializers.ModelSerializer):
    departamentos = SubDepartamentoSerializer(many=True, read_only=True)

    class Meta:
        model = Departamento
        fields = '__all__'