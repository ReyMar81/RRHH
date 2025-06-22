from django.db import models
from django.db.models import ForeignKey
from apps.empresas.models import Empresa
from datetime import datetime, timedelta

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
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    cargo_padre = ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subcargos'
    )
    horas_de_trabajo = models.DecimalField(max_digits=5,decimal_places=2,default=0,blank=True)
    empresa=models.ForeignKey(Empresa,on_delete=models.CASCADE)
    
    def save(self, *args, **kwargs):
        # Calcular diferencia en horas entre horario_inicio y horario_fin
        dt_inicio = datetime.combine(datetime.today(), self.horario_inicio)
        dt_fin = datetime.combine(datetime.today(), self.horario_fin)

        if dt_fin < dt_inicio:
            dt_fin += timedelta(days=1)  # horario cruzado a otro día

        total_horas = (dt_fin - dt_inicio).total_seconds() / 3600.0
        total_horas -= float(self.receso_diario)  # descuenta el receso

        self.horas_de_trabajo = round(total_horas, 2) 

        super().save(*args, **kwargs)