from django.db import models

# Modelos para la lógica de nómina irán aquí

class EstructuraSalarial(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    empresa = models.ForeignKey('empresas.Empresa', on_delete=models.CASCADE, related_name='estructuras_salariales')
    tipo_contrato = models.CharField(max_length=15, blank=True, null=True)
    pais = models.CharField(max_length=50, blank=True, null=True)
    activa = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

class ReglaSalarial(models.Model):
    TIPO = (
        ('ingreso', 'Ingreso'),
        ('deduccion', 'Deducción'),
        ('bono', 'Bono'),
        ('hora_extra', 'Hora Extra'),
    )
    estructura = models.ForeignKey(EstructuraSalarial, on_delete=models.CASCADE, related_name='reglas')
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=50)
    tipo = models.CharField(max_length=20, choices=TIPO)
    secuencia = models.PositiveIntegerField(default=10)
    condicion = models.TextField(blank=True, help_text="Expresión Python evaluable, ejemplo: empleado.cargo == 'Gerente'")
    formula = models.TextField(help_text="Expresión Python evaluable, ejemplo: salario_base * 0.10")
    empresa = models.ForeignKey('empresas.Empresa', on_delete=models.CASCADE, related_name='reglas_salariales')
    pais = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"

class BoletaPago(models.Model):
    ESTADO = (
        ('borrador', 'Borrador'),
        ('validada', 'Validada'),
        ('pagada', 'Pagada'),
    )
    MODO = (
        ('manual', 'Manual'),
        ('automatico', 'Automático'),
    )
    empleado = models.ForeignKey('empleado.Empleado', on_delete=models.CASCADE, related_name='boletas_pago')
    contrato = models.ForeignKey('contrato.Contrato', on_delete=models.PROTECT, related_name='boletas_pago')
    empresa = models.ForeignKey('empresas.Empresa', on_delete=models.CASCADE)
    estructura = models.ForeignKey(EstructuraSalarial, on_delete=models.SET_NULL, null=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO, default='borrador')
    total_ingresos = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_deducciones = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_neto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    modo_generacion = models.CharField(max_length=20, choices=MODO, default='manual')

    def __str__(self):
        return f"Boleta de {self.empleado} ({self.fecha_inicio} - {self.fecha_fin})"

class DetalleBoletaPago(models.Model):
    boleta = models.ForeignKey(BoletaPago, on_delete=models.CASCADE, related_name='detalles')
    regla = models.ForeignKey(ReglaSalarial, on_delete=models.SET_NULL, null=True)
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=50)
    tipo = models.CharField(max_length=20)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    secuencia = models.PositiveIntegerField(default=10)

    def __str__(self):
        return f"{self.nombre} - {self.monto}"
