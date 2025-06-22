from rest_framework import serializers
from .models import Notificacion

class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        exclude = ['empresa']
        read_only_fields = ['user', 'fecha_creacion']
