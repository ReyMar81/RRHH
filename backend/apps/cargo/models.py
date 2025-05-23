from django.db import models
from django.db.models import ForeignKey


TIPO_PAGO_CHOICES = [
    ('mensual', 'Mensual'),
    ('quincenal', 'Quincenal'),
    ('semanal', 'Semanal'),
    ('diario', 'Diario'),
    ('hora', 'Por hora'),
]

# Create your models here.
class Cargo(models.Model):
    nombre = models.CharField(max_length=50)
    tipo_pago = models.CharField(max_length=20, choices=TIPO_PAGO_CHOICES)
    salario = models.DecimalField(max_digits=10, decimal_places=2)
    receso_diario = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    horario_inicio = models.TimeField()
    horario_fin = models.TimeField()
    cargo_padre = ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subcargos'
    )
