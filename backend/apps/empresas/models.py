from django.db import models

# Create your models here.

class Empresa(models.Model):
    paises_Choices=[
        ('BOL','BOLIVIA')
    ]
    nombre=models.TextField(max_length=100)
    pais=models.CharField(max_length=3,choices=paises_Choices)
    direccion=models.TextField(blank=True,null=True)
    telefono=models.CharField(max_length=20,blank=True,null=True)
    email=models.EmailField(blank=True,null=True)
    fecha_registro=models.DateTimeField(auto_now_add=True)
    estado=models.BooleanField(default=True)
    
    autorizaHorasExtra=models.BooleanField(default=True,blank=True)