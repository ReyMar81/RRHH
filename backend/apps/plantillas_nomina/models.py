from django.db import models

class Pais(models.Model):
    codigo = models.CharField(max_length=5, unique=True)
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class EstructuraSalarialPlantilla(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    pais = models.ForeignKey(Pais, on_delete=models.CASCADE, related_name='estructuras_plantilla')
    tipo_contrato = models.CharField(max_length=15, blank=True, null=True)
    activa = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} ({self.pais})"

class ReglaSalarialPlantilla(models.Model):
    estructura = models.ForeignKey(EstructuraSalarialPlantilla, on_delete=models.CASCADE, related_name='reglas')
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=50)
    tipo = models.CharField(max_length=20)
    secuencia = models.PositiveIntegerField(default=10)
    condicion = models.TextField(blank=True)
    formula = models.TextField()
    pais = models.ForeignKey(Pais, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"
