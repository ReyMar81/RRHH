from django.db import models
from django.db.models import ForeignKey, Model


# Create your models here.

class Cargo(models.Model):
    nombre = models.CharField(max_length=50)
    tipo_pago = models.CharField(max_length=50)
    salario = models.DecimalField(max_digits=10, decimal_places=2)
    horas_por_dia = models.DurationField()
    horario_inicio = models.TimeField()
    horario_fin = models.TimeField()
    cargo_padre = ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subcargos'
    )
