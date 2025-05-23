from django.db import models

class Tipo(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    es_requerido = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)