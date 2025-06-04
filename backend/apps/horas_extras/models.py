from django.db import models

from apps.empleado.models import Empleado
from apps.empresas.models import Empresa


# Create your models here.

class HorasExtras(models.Model):
    PAGADO = 'PAGADO'
    IMPAGO = 'IMPAGO'

    estados = [
        (PAGADO, 'Pagago'),
        (IMPAGO, 'Impago'),
    ]

    cantidad_horas = models.DurationField()
    estado = models.CharField(max_length=7, choices=estados)
    motivo = models.CharField(max_length=100)
    empleado_autorizador = models.ForeignKey(
        Empleado,
        on_delete=models.PROTECT,
        related_name='horas_extras'
    )
    fecha_autorizacion = models.DateField()
    empresa=models.ForeignKey(Empresa, on_delete=models.CASCADE)