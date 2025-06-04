from django.db import models
from apps.empresas.models import Empresa

# Create your models here.

class Documento(models.Model):
    titulo = models.CharField(max_length=255)
    url = models.URLField()
    fecha_subida = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)
    tipo_id = models.ForeignKey('tipo.Tipo', on_delete=models.PROTECT)
    categoria_id = models.ForeignKey('categoria.Categoria', on_delete=models.PROTECT)
    empleado_id = models.ForeignKey('empleado.Empleado', on_delete=models.CASCADE)
    contrato_id = models.ForeignKey('contrato.Contrato', on_delete=models.SET_NULL, null=True, blank=True)
    empresa=models.ForeignKey(Empresa, on_delete=models.CASCADE)