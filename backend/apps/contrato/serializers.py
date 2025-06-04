from rest_framework import serializers

from apps.contrato.models import Contrato


class ContratoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contrato
        exclude = ['empresa']

    def create(self, validated_data):
        # Si no se proporciona salario personalizado, usar el del cargo asociado
        if not validated_data.get('salario_personalizado'):
            cargo_departamento = validated_data['cargo_departamento']
            validated_data['salario_personalizado'] = cargo_departamento.id_cargo.salario

        return super().create(validated_data)
    
    def validate(self, data):
    # Validación de contrato activo
        if data['estado'] == 'activo':
            empleado = data['empleado']
            contrato_existente = Contrato.objects.filter(
                empleado=empleado,
                estado='activo'
            )
            if self.instance:
                contrato_existente = contrato_existente.exclude(id=self.instance.id)

            if contrato_existente.exists():
                raise serializers.ValidationError(
                    {"estado": "Este empleado ya tiene un contrato activo."}
                )
        # Validación de fechas
        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')
        if fecha_fin and fecha_inicio and fecha_fin < fecha_inicio:
            raise serializers.ValidationError(
                {"fecha_fin": "La fecha de fin no puede ser anterior a la de inicio."}
            )

        return data
