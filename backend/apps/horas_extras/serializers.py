from rest_framework import serializers

from apps.horas_extras.models import HorasExtras


class HorasExtrasSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorasExtras
        fields = '__all__'