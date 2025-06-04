from rest_framework import serializers

from apps.asistencia.models import Asistencia

class AsistenciaSerializer(serializers.ModelSerializer):
    nombre_empleado = serializers.SerializerMethodField()

    class Meta:
        model = Asistencia
        exclude=['empresa']
        read_only_fields = ['fecha', 'hora_entrada', 'hora_salida', 'horas_trabajadas']
       
    def get_nombre_empleado(self, obj):
        return f"{obj.empleado.nombre} {obj.empleado.apellidos}"
