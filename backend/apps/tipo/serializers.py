from rest_framework import serializers
from .models import Tipo

class TipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tipo
        exclude = ['empresa']
