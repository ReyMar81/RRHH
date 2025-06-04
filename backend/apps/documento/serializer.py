from rest_framework import serializers
from .models import Documento

class DocumentoSerializers(serializers.ModelSerializer):
    class Meta:
        model = Documento
        exclude = ['empresa']