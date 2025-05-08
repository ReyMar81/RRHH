from rest_framework import serializers
from .models import Empleado

class EmpleadoSerializers(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = '__all__'
        read_only_fields = ['user_id']