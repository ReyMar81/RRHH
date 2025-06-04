from rest_framework import serializers

from apps.cargo_departamento.models import CargoDepartamento


class CargoDepartamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CargoDepartamento
        exclude  = ['empresa']