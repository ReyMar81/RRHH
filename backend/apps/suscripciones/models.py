from django.db import models
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from apps.empresas.models import Empresa
from django.contrib.auth.models import Permission

# Create your models here.

class Plan(models.Model):
    duracion_choise=[
        ('d', 'Dia/s'),
        ('m','Mes/es'),
        ('a','Año/s')
    ]
    nombre=models.TextField(max_length=100)
    tipo_de_duracion=models.CharField(max_length=1,choices=duracion_choise)
    cantidad_duracion=models.CharField(max_length=3)
    precio=models.PositiveSmallIntegerField()
    fecha_creacion=models.DateTimeField(auto_now_add=True)
    
class Suscripcion(models.Model):
    estado=models.BooleanField(default=True)
    fecha_Inicio=models.DatetField(auto_now_add=True)
    fecha_Fin=models.DateField(blank=True,null=True)
    plan=models.ForeignKey(Plan,on_delete=models.SET_NULL,null=True)
    empresa=models.ForeignKey(Empresa,on_delete=models.CASCADE)
    fecha_creacion=models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if self.plan:
            cantidad = int(self.plan.cantidad_duracion)
            if self.plan.tipo_de_duracion == 'd':
                self.fecha_Fin = self.fecha_Inicio + timedelta(days=cantidad)
            elif self.plan.tipo_de_duracion == 'm':
                self.fecha_Fin = self.fecha_Inicio + relativedelta(months=cantidad)
            elif self.plan.tipo_de_duracion == 'a':
                self.fecha_Fin = self.fecha_Inicio + relativedelta(years=cantidad)
        super().save(*args, **kwargs)
        
class Planes_Privilegios(models.Model):
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE)
    privilegio = models.ForeignKey(Permission, on_delete=models.CASCADE)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('plan', 'privilegio')

