from rest_framework import serializers
from django.contrib.auth.models import Group
from security.models import Usuario

class UsuarioRolSerializer(serializers.Serializer):
    usuario_id = serializers.PrimaryKeyRelatedField(queryset=Usuario.objects.all())
    group_id = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all())
