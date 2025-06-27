from rest_framework import serializers
from .models import Evaluacion, CriterioEvaluacion, ResultadoEvaluacion

class EvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluacion
        exclude = ['empresa']
        
class CriterioEvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CriterioEvaluacion
        exclude = ['empresa']

class ResultadoEvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultadoEvaluacion
        exclude = ['empresa']

class EvaluacionPendienteSimpleSerializer(serializers.ModelSerializer):
    evaluado_nombre = serializers.SerializerMethodField()
    solicitador_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Evaluacion
        fields = [
            'id',
            'evaluado',
            'evaluado_nombre',
            'solicitador',
            'solicitador_nombre',
            'motivo',
            'estado',
            'fecha_creacion',
        ]

    def get_evaluado_nombre(self, obj):
        return f"{obj.evaluado.nombre} {obj.evaluado.apellidos}" if obj.evaluado else ""

    def get_solicitador_nombre(self, obj):
        return f"{obj.solicitador.nombre} {obj.solicitador.apellidos}" if obj.solicitador else ""

class ResultadoEvaluacionDetalleSerializer(serializers.ModelSerializer):
    criterio_nombre = serializers.CharField(source='criterio.nombre', read_only=True)
    criterio_descripcion = serializers.CharField(source='criterio.descripcion', read_only=True)

    class Meta:
        model = ResultadoEvaluacion
        fields = [
            'id',
            'criterio',
            'criterio_nombre',
            'criterio_descripcion',
            'puntaje',
            'comentario',
        ]