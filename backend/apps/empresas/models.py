from django.db import models
from django.contrib.auth.models import AbstractUser,Group

# Create your models here.

class Empresa(models.Model):
    paises_Choices=[
        ('BOL','BOLIVIA')
    ]
    nombre=models.TextField(max_length=100)
    pais=models.CharField(max_length=3,choices=paises_Choices)
    direccion=models.TextField(blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)
    telefono=models.CharField(max_length=20,blank=True,null=True)
    
    db_name=models.CharField(max_length=50,unique=True,blank=True,null=True)
    dominio=models.CharField(max_length=50,unique=True,blank=True,null=True)
    
