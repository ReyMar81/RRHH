from django.db import models

from apps.empleado.models import Empleado
from apps.empresas.models import Empresa
from apps.departamento.models import Departamento
from datetime import timedelta
from django.utils import timezone

# Create your models here.

class HorasExtras(models.Model):
    PAGADO = 'PAGADO'
    IMPAGO = 'IMPAGO'

    estados = [
        (PAGADO, 'Pagago'),
        (IMPAGO, 'Impago'),
    ]

    cantidad_horas_extra_trabajadas = models.DurationField()
    cantidad_horas_extra_solicitadas = models.DurationField(null=True,blank=True)
    estado = models.CharField(max_length=7, choices=estados)
    aprobado = models.BooleanField(blank=True, null=True)
    motivo = models.CharField(max_length=255, blank= True, null=True)
    empleado_autorizador = models.ForeignKey(
        Empleado,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name='horas_extras_autorizador'
    )
    empleado_solicitador = models.ForeignKey(
        Empleado,
        on_delete=models.PROTECT,
        related_name='horas_extra_solicitador'
    )
    fecha_solicitud = models.DateTimeField(blank=True, null=True)
    fecha_autorizacion = models.DateTimeField(blank=True, null=True)
    empresa=models.ForeignKey(Empresa, on_delete=models.CASCADE)
    
    def puede_ser_aprobada_por(self, aprobador: Empleado):
        return Aprobadores.objects.filter(
            empleado=aprobador,
            departamento=self.empleado_solicitador.departamento_del_empleado(),
            encargado_de = 'hora_extra'
        ).exists()
    
    @staticmethod
    def create(empleado:Empleado, horas):
        duracion = timedelta(hours=horas)
        empresa = empleado.empresa
        if empresa.autorizaHorasExtra:
            try:
                horasExtras = HorasExtras.objects.filter(
                    empleado_solicitador=empleado,
                    empleado_autorizador__isnull=False
                    ).latest('fecha_autorizacion')
            except HorasExtras.DoesNotExist:
                return 
            if(horasExtras.aprobado):
                cumplio_sus_horas_extra = horasExtras.cantidad_horas_extra_trabajadas > horasExtras.cantidad_horas_extra_solicitadas
                if(not cumplio_sus_horas_extra):
                    horasExtras.cantidad_horas_extra_solicitadas += duracion
                    horasExtras.save()
                
        else:
            HorasExtras.objects.create(
                cantidad_horas_extra_trabajadas=duracion,
                estado = "IMPAGO",
                motivo = "Trabajo tiempo extra",
                empleado_solicitador = empleado,
                fecha_autorizacion = timezone.now(),
                empresa = empleado.empresa
            )

ENCARGADO_CHOICES = [
    ('hora_extra', 'Hora Extra'),
    ('evaluacion', 'Evaluación'),
]

class Aprobadores(models.Model):
    empleado = models.ForeignKey(Empleado, on_delete=models.PROTECT,)
    departamento = models.ForeignKey(Departamento, on_delete=models.PROTECT)
    empresa=models.ForeignKey(Empresa, on_delete=models.CASCADE)
    encargado_de = models.CharField(max_length=15,choices=ENCARGADO_CHOICES)
