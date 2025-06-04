from django.db import models
from apps.empresas.models import Empresa

# Create your models here.


class Departamento(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    departamento_padre = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subdepartamentos'
    )
    empresa=models.ForeignKey(Empresa, on_delete=models.CASCADE)