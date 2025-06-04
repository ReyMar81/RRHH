from django.db import models
from apps.empresas.models import Empresa

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    empresa=models.ForeignKey(Empresa,on_delete=models.CASCADE)
    