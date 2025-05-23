from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()

# choices
genero_Choices = [
    ('M', 'Masculino'),
    ('F','Femenino'),
    #('T', 'Transformer')
    ]
estado_Civil_Choise = [
    ('S','Soltero/a'),
    ('C','Casado/a'),
    ('V','Viudo/a'),
    ]

# Create your models here.
class Empleado(models.Model):
    nombre = models.CharField(max_length=30)
    apellidos = models.CharField(max_length=30)
    ci = models.IntegerField()
    fecha_nacimiento = models.DateField(null=True, blank=True)
    genero = models.CharField(max_length=1, choices=genero_Choices, null=True,
                              blank=True)
    direccion = models.CharField(max_length=100, null=True, blank=True)
    estado_civil = models.CharField(max_length=1, choices=estado_Civil_Choise,
                                    null=True, blank=True)
    telefono = models.CharField(max_length=20)
    fecha_ingreso = models.DateField(auto_now_add=True)
    correo_personal = models.EmailField(max_length=254, null=True, blank=True)
    user_id = models.OneToOneField(User, on_delete=models.CASCADE, 
                                   related_name='empleado', blank=True)