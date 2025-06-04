from auditlog.models import LogEntry
from rest_framework import serializers
from apps.bitacora.models import Bitacora

class LogEntrySerializer(serializers.ModelSerializer):
    content_object_repr = serializers.SerializerMethodField()

    class Meta:
        model = LogEntry
        fields = '__all__'

    def get_content_object_repr(self, obj):
        try:
            return str(obj.object_repr)
        except:
            return None

class BitacoraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bitacora
        fields = ['empresa', 'usuario', 'accion', 'ip', 'detalles', 'fecha_maquina', 'fecha_servidor']
