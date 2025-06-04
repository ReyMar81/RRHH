from django.db import models

from apps.empleado.models import Empleado
from apps.empresas.models import Empresa


# Create your models here.

class Asistencia(models.Model):
    fecha = models.DateField(auto_now_add=True)
    hora_entrada = models.TimeField(null=True, blank=True)
    hora_salida = models.TimeField(null=True, blank=True)
    horas_trabajadas = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    observaciones = models.CharField(max_length=255, blank=True)
    
    empleado = models.ForeignKey(
        Empleado,
        on_delete=models.PROTECT,
        related_name='asistencias'
    )
    empresa=models.ForeignKey(Empresa,on_delete=models.CASCADE)
    
    

    class Meta:
        unique_together = ('fecha', 'empleado')