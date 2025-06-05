from django.contrib.auth.models import AbstractUser,Group
from django.db import models
from apps.empresas.models import Empresa

class Usuario(AbstractUser):
    cambio_password_pendiente = models.BooleanField(default=True)
    empresa=models.ForeignKey(Empresa,on_delete=models.CASCADE, null=True, blank=True)

class UserTheme(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, related_name="theme")
    color_text = models.CharField(max_length=7, default="#8A8585")  # Color del texto
    color1 = models.CharField(max_length=7, default="#0040FF")  # Color principal
    color2 = models.CharField(max_length=7, default="#ffffff")  # Color secundario
    font_size = models.CharField(max_length=10, default="16px")  # Tamaño de fuente
    font_family = models.CharField(max_length=100, default="Arial, sans-serif")  # Fuente
    empresa=models.ForeignKey(Empresa,on_delete=models.CASCADE, null=True, blank=True)
    
class Usuario_rol(models.Model):
    usuario=models.ForeignKey(Usuario,on_delete=models.CASCADE)
    rol=models.ForeignKey(Group,on_delete=models.CASCADE)
    creat_at=models.DateTimeField(auto_now_add=True)
