from rest_framework import serializers

class ClonarEstructuraPlantillaSerializer(serializers.Serializer):
    empresa_id = serializers.IntegerField()
    pais_id = serializers.IntegerField()
