from rest_framework import serializers

from .models import Cargo


class SubCargosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        exclude = ['id', 'nombre', 'tipo_pago', 'salario', 'empresa']

class CargoSerializer(serializers.ModelSerializer):
    subcargos = SubCargosSerializer(many=True, read_only=True)

    class Meta:
        model = Cargo
        exclude = ['empresa']
