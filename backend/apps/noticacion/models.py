from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.empresas.models import Empresa
# Create your models here.

User = get_user_model()

class Notificacion(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notificaciones')
    titulo = models.CharField(max_length=100)
    mensaje = models.TextField()
    url = models.URLField(blank=True, null=True)
    leido = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(default=timezone.now)
    
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)

    
