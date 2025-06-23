from rest_framework import serializers
from .models import Evaluacion, CriterioEvaluacion, ResultadoEvaluacion


class EvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluacion
        exclude = ['empresa']
        
class CriterioEvaluacionSereializer(serializers.ModelSerializer):
    class Meta:
        model = CriterioEvaluacion
        exclude = ['empresa']

class ResultadoEvaluacionSereializer(serializers.ModelSerializer):
    class Meta:
        model = ResultadoEvaluacion
        exclude = ['empresa']