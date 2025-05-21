from django.db import models

from apps.cargo_departamento.models import CargoDepartamento
from apps.empleado.models import Empleado


# Create your models here.

class Contrato(models.Model):

    TIPOS_CONTRATO = [
        ('INDEFINIDO', 'Indefinido'),
        ('PLAZO FIJO', 'Plazo fijo'),
        ('MEDIO TIEMPO', 'Medio tiempo'),
        ('PASANTIA', 'Pasantía'),
    ]

    ESTADOS_CONTRATO = [
        ('ACTIVO', 'Activo'),
        ('FINALIZADO', 'Finalizado'),
        ('PENDIENTE', 'Pendiente'),  #Pendiente de firma
        ('RENOVADO', 'Renovado'),
    ]

    tipo_contrato = models.CharField(max_length=15, choices=TIPOS_CONTRATO)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    salario_personalizado = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    estado = models.CharField(max_length=12, choices=ESTADOS_CONTRATO)
    observaciones = models.CharField(max_length=100)
    empleado = models.ForeignKey(
        Empleado,
        on_delete=models.PROTECT,
        related_name='contratos'
    )
    cargo_departamento = models.ForeignKey(
        CargoDepartamento,
        on_delete=models.PROTECT,
        related_name='contratos'
    )