from django.db import models

from apps.cargo_departamento.models import CargoDepartamento
from apps.empleado.models import Empleado
from apps.empresas.models import Empresa

# choices
TIPOS_CONTRATO = [
        ('INDEFINIDO', 'Indefinido'),
        ('PLAZO FIJO', 'Plazo fijo'),
        ('MEDIO TIEMPO', 'Medio tiempo'),
        ('PASANTIA', 'Pasantía'),
    ]

ESTADOS_CONTRATO = [
        ('ACTIVO', 'Activo'),
        ('FINALIZADO', 'Finalizado'),
        ('PENDIENTE', 'Pendiente'),
        ('RENOVADO', 'Renovado'),
    ]

# Create your models here.
class Contrato(models.Model):
    tipo_contrato = models.CharField(max_length=15, choices=TIPOS_CONTRATO)
    fecha_creacion = models.DateTimeField(auto_now_add=True, null=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(null=True, blank=True)
    salario_personalizado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=12, choices=ESTADOS_CONTRATO)
    observaciones = models.CharField(max_length=100, null=True, blank=True)
    empleado = models.ForeignKey(Empleado, on_delete=models.PROTECT, related_name='contratos')
    cargo_departamento = models.ForeignKey(CargoDepartamento, on_delete=models.PROTECT, related_name='contratos')
    empresa=models.ForeignKey(Empresa, on_delete=models.CASCADE)
    
    evaluacion_periodicidad  = models.DurationField(null=True, blank=True) #Dias 
    ultima_evaluacion_programada = models.DateField(null=True, blank=True)