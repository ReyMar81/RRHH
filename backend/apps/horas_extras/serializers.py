from rest_framework import serializers

from apps.horas_extras.models import HorasExtras, AprobadoresDeHorasExtra


class HorasExtrasSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorasExtras
        exclude = ['empresa']
        
class AprobadoresDeHorasExtraSereializer(serializers.ModelSerializer):
    class Meta:
        model = AprobadoresDeHorasExtra
        exclude = ['empresa']