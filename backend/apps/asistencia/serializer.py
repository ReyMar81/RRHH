from rest_framework import serializers

from apps.asistencia.models import Asistencia


class AsistenciaSerializer(serializers.ModelSerializer):
    nombre_empleado = serializers.CharField(source='empleado.nombre_completo', read_only=True)

    class Meta:
        model = Asistencia
        fields = ['id', 'fecha', 'hora_entrada', 'hora_salida', 'observaciones', 'empleado', 'nombre_empleado']
        read_only_fields = ['fecha', 'hora_entrada', 'hora_salida']
