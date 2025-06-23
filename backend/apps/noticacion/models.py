from django.db import models
from django.utils import timezone
from apps.empresas.models import Empresa
from apps.empleado.models import Empleado
# Create your models here.
class Notificacion(models.Model):
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE)
    titulo = models.CharField(max_length=100)
    mensaje = models.TextField()
    url = models.URLField(blank=True, null=True)
    leido = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(default=timezone.now)
    
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)

    
