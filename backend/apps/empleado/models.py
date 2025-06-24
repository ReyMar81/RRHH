from django.db import models
from django.contrib.auth import get_user_model
from apps.empresas.models import Empresa


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
    cuenta_bancaria = models.CharField(max_length=25, null=True, blank=True)
    user_id = models.OneToOneField(User, on_delete=models.CASCADE, 
                                   related_name='empleado', blank=True)
    empresa=models.ForeignKey(Empresa, on_delete=models.CASCADE)
    
    def departamento_del_empleado(self):
        from apps.contrato.models import Contrato
        contrato = Contrato.objects.filter(empleado=self, estado='ACTIVO').select_related('cargo_departamento__id_departamento').first()
        if contrato:
            return contrato.cargo_departamento.id_departamento
        return None