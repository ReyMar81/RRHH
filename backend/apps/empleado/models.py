from django.db import models
from django.contrib.auth.models import User


#  Definición de opciones (choices) fuera de la clase para más orden
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
    """
    Modelo que representa a los empleados de la empresa.

    ATRIBUTOS:
        nombre (CharField|varchar):
            Nombre del empleado (máx 30 caracteres).
        apellidos (CharField|varchar):
            Apellido del empleado (máx 30 caracteres).
        ci (IntegerField|int):
            Número de cédula de identidad único.
        fecha_nacimiento (DateField|null): 
            Fecha de nacimiento (opcional).
        genero (CharField|char):
            Género del empleado, valores permitidos ('M' o 'F').
        direccion (CharField|varchar|null):
            Dirección actual del empleado (opcional).
        estado_civil (CharField|char|null):
            Estado civil ('S', 'C' o 'V') (opcional).
        telefono (CharField|varchar):
            Número de teléfono de contacto.
        cargo (CharField|varchar|null):
            Cargo que ocupa el empleado en la empresa (opcional).
        fecha_ingreso (DateField):
            Fecha de ingreso del empleado, establecida automáticamente.
        user_id (OneToOneField):
            Relación uno a uno con el modelo User de Django.
        departamento_id (ForeignKey|null):
            Departamento al que pertenece el empleado (opcional).

    METODOS:
        __str__():
            Retorna una representación legible del empleado (nombre completo).
    """
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
    cargo = models.CharField(max_length=100, null=True, blank=True)
    fecha_ingreso = models.DateField(auto_now_add=True)
    correo_personal = models.EmailField(max_length=254, null=True, blank=True)
    user_id = models.OneToOneField(User, on_delete=models.CASCADE, 
                                   related_name='empleado', blank=True)
    departamento_id =models.ForeignKey('departamento.Departamento',
                                        on_delete=models.SET_NULL, null=True,
                                        blank=True)