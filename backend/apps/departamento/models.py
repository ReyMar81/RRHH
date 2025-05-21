from django.db import models

# Create your models here.


class Departamento(models.Model):
    """
    Modelo que representa los departamentos de la empresa.

    ATRIBUTOS:
        nombre (CharField|varchar):
            Nombre del departamento (máx 100 caracteres).
        descripcion (TextField|text):
            Descripción detallada del departamento.
        fecha_creacion (DateTimeField):
            Fecha de creación del departamento, establecida automáticamente.
        departamento_padde (ForeignKey)
            Relación de hacia la misma tabla, (un departamento puede ser un subdepartamento,
            un departamento puede tener varios subdepartamentos)

    METODOS:
        __str__():
            Retorna el nombre del departamento como representación legible.
    """

    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    departamento_padre = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='departamentos'
    )
    