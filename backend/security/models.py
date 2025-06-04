from django.contrib.auth.models import AbstractUser,Group
from django.db import models
from apps.empresas.models import Empresa

class Usuario(AbstractUser):
    cambio_password_pendiente = models.BooleanField(default=True)
    empresa=models.ForeignKey(Empresa,on_delete=models.CASCADE, null=True, blank=True)
    
class Usuario_rol(models.Model):
    usuario=models.ForeignKey(Usuario,on_delete=models.CASCADE)
    rol=models.ForeignKey(Group,on_delete=models.CASCADE)
    creat_at=models.DateTimeField(auto_now_add=True)