from rest_framework import serializers
from .models import Plan, Suscripcion, Planes_Privilegios
from django.contrib.auth.models import Permission

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__'

class SuscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suscripcion
        fields = '__all__'
        read_only_fields = ('fecha_Fin',) 

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename']

class PlanesPrivilegiosSerializer(serializers.ModelSerializer):
    privilegio = PermissionSerializer(read_only=True)
    privilegio_id = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        source='privilegio',
        write_only=True
    )
    class Meta:
        model = Planes_Privilegios
        fields = ['id', 'plan', 'privilegio', 'privilegio_id', 'fecha_creacion']
