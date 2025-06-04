from django.db import models
from django.utils import timezone
from apps.empresas.models import Empresa
from django.conf import settings

class Bitacora(models.Model):
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    fecha_servidor = models.DateTimeField(default=timezone.now)
    fecha_maquina = models.DateTimeField(null=True, blank=True)
    accion = models.CharField(max_length=255)
    ip = models.GenericIPAddressField(null=True, blank=True)
    detalles = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-fecha_servidor']
        indexes = [
            models.Index(fields=['empresa', 'fecha_servidor']),
        ]

    def __str__(self):
        return f"{self.empresa} | {self.usuario} | {self.accion} | {self.fecha_servidor}"
