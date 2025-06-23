from django.db import models
from apps.empleado.models import Empleado
from apps.empresas.models import Empresa

from apps.horas_extras.models import Aprobadores

# Create your models here.
ESTADO_CHOICES = [
    ('pendiente', 'Pendiente'),
    ('completada', 'Completada'),
    ('en proceso', 'En Proceso')
]
PUNTAJE_CHOICES = [
    ('excelente', 'EXCELENTE'),
    ('bueno', 'BUENO'),
    ('regular', 'REGULAR'),
    ('malo', 'MALO'),
    ('pesimo', 'PESIMO'),
]

class Evaluacion(models.Model):
    evaluador = models.ForeignKey(
        Empleado,
        on_delete=models.PROTECT,
        related_name='evaluaciones_realizadas',
        blank=True, 
        null=True
        )
    evaluado = models.ForeignKey(
        Empleado,
        on_delete=models.PROTECT,
        related_name='evaluaciones_recibidas'
        )
    solicitador = models.ForeignKey(
        Empleado,
        on_delete=models.PROTECT,
        related_name='evaluaciones_solicitada'
        )
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_fin = models.DateTimeField(blank=True,null=True)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='pendiente')
    comentario_general = models.TextField(blank=True, null=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    
    def puede_ser_evaluado_por(self, evaluador: Empleado):
        return Aprobadores.objects.filter(
            empleado=evaluador,
            departamento=self.evaluado.departamento_del_empleado(),
            encargado_de = 'evaluacion'
        ).exists()
        
    
    
class CriterioEvaluacion(models.Model):
    nombre = models.CharField(max_length=75)
    descripcion = models.TextField()
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)

class ResultadoEvaluacion(models.Model):
    evaluacion = models.ForeignKey(Evaluacion, on_delete=models.CASCADE)
    criterio = models.ForeignKey(CriterioEvaluacion, on_delete=models.CASCADE)
    puntaje = models.CharField(max_length=15, choices=PUNTAJE_CHOICES)
    comentario = models.TextField(blank=True,null=True)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)