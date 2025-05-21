from django.db import models

from apps.empleado.models import Empleado


# Create your models here.

class Asistencia(models.Model):
    fecha = models.DateField(auto_now_add=True)
    hora_entrada = models.TimeField()
    hora_salida = models.TimeField()
    observaciones = models.CharField(max_length=100)
    id_empleado = models.ForeignKey(
        Empleado,
        on_delete=models.PROTECT,
        related_name='asistencias'
    )