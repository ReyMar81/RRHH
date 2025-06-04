from rest_framework import serializers
from apps.contrato.models import Contrato
from .models import Empleado

class EmpleadoSerializers(serializers.ModelSerializer):
    cargo = serializers.SerializerMethodField()
    class Meta:
        model = Empleado
        exclude = ['empresa']
        read_only_fields = ['user_id']

    def get_cargo(self, obj):
        
        request = self.context.get('request')
        if not request:
            return None
    
        contrato = Contrato.objects.select_related(
            'cargo_departamento', 'cargo_departamento__id_cargo'
        ).filter(empleado=obj,
                 estado='ACTIVO',
                 empresa=request.user.empresa).first()
        
        if contrato and contrato.cargo_departamento and contrato.cargo_departamento.id_cargo:
            return contrato.cargo_departamento.id_cargo.nombre
        return None
    
class CambiarPasswordConValidacionSerializer(serializers.Serializer):
    actual_password = serializers.CharField(write_only=True, required=False)
    nueva_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        user = self.context['request'].user

        # Si es primer ingreso, no se requiere validar la contraseña actual
        if user.cambio_password_pendiente:
            return data

        # Si no es primer ingreso, validamos que se haya enviado actual_password
        actual_password = data.get('actual_password')
        if not actual_password:
            raise serializers.ValidationError({
                "actual_password": "Este campo es obligatorio para cambiar la contraseña."
            })

        if not user.check_password(actual_password):
            raise serializers.ValidationError({
                "actual_password": "Contraseña actual incorrecta."
            })

        return data