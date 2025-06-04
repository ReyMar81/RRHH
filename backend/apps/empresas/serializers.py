from rest_framework import serializers
from apps.empresas.models import Empresa
from apps.suscripciones.models import Plan

class EmpresaRegistroSerializer(serializers.Serializer):
    nombre = serializers.CharField(max_length=100)
    direccion = serializers.CharField(max_length=255, required=False)
    telefono = serializers.CharField(max_length=30, required=False)
    email_admin = serializers.EmailField()
    username_admin = serializers.CharField(max_length=100, required=False)
    plan_id = serializers.PrimaryKeyRelatedField(queryset=Plan.objects.all(), required=False, allow_null=True)

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'
