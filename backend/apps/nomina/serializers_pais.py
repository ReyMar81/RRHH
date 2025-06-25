from rest_framework import serializers
from apps.plantillas_nomina.models import Pais

class PaisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pais
        fields = ['id', 'codigo', 'nombre']
