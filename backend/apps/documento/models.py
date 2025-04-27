from django.db import models

# Create your models here.


class Documento(models.Model):
    """
    Modelo que representa los documentos asociados a los empleados.

    ATRIBUTOS:
        nombre (CharField|varchar):
            Nombre del documento (máx 255 caracteres).
        tipo_documento (CharField|varchar):
            Tipo o categoría del documento (máx 100 caracteres).
        url (URLField|url):
            URL donde está almacenado el documento.
        fecha_subida (DateTimeField):
            Fecha en que se subió el documento, establecida automáticamente.
        fecha_modificacion (DateTimeField):
            Fecha de la última modificación del documento, actualizada automáticamente.
        empleado_id (ForeignKey):
            Referencia al empleado propietario del documento.

    METODOS:
        __str__():
            Retorna el nombre del documento como representación legible.
    """

    nombre = models.CharField(max_length=255)
    tipo_documento = models.CharField(max_length=100)
    url = models.URLField()
    fecha_subida = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(auto_now=True)
    empleado_id = models.ForeignKey('empleados.Empleado', on_delete=models.CASCADE)
    
    