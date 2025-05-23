from rest_framework import serializers

from apps.asistencia.models import Asistencia

class AsistenciaSerializer(serializers.ModelSerializer):
    nombre_empleado = serializers.SerializerMethodField()

    class Meta:
        model = Asistencia
        fields = [
            'id', 'fecha', 'hora_entrada', 'hora_salida',
            'horas_trabajadas', 'observaciones', 'empleado', 'nombre_empleado'
        ]
        read_only_fields = ['fecha', 'hora_entrada', 'hora_salida', 'horas_trabajadas']

    def get_nombre_empleado(self, obj):
        return f"{obj.empleado.nombre} {obj.empleado.apellidos}"
