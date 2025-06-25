from rest_framework import serializers

class ClonarEstructuraPlantillaSerializer(serializers.Serializer):
    empresa_id = serializers.IntegerField()
    estructura_plantilla_id = serializers.IntegerField()
