
from django.core.management.base import BaseCommand
from apps.asistencia.models import Asistencia
from apps.horas_extras.models import HorasExtras, Aprobadores
from apps.empleado.models import Empleado
from apps.empresas.models import Empresa
from datetime import datetime, timedelta, date, time
from decimal import Decimal
import random
from django.db import IntegrityError
from dateutil.relativedelta import relativedelta

class Command(BaseCommand):
    help = 'Genera asistencias y horas extras para empleados de una empresa específica'

    def handle(self, *args, **kwargs):
        # ⚠️ Cambiar aquí el nombre exacto de la empresa deseada
        nombre_empresa = 'Textiles El Valle'

        try:
            empresa = Empresa.objects.get(nombre=nombre_empresa)
        except Empresa.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'❌ Empresa no encontrada: {nombre_empresa}'))
            return

        empleados = Empleado.objects.filter(empresa=empresa)
        if not empleados.exists():
            self.stdout.write(self.style.ERROR(f'❌ No hay empleados en la empresa {nombre_empresa}'))
            return

        aprobadores = Aprobadores.objects.filter(empresa=empresa, encargado_de='hora_extra')

        fecha_fin = date.today()
        fecha_inicio = fecha_fin - relativedelta(months=2)
        fecha_actual = fecha_inicio

        while fecha_actual <= fecha_fin:
            if fecha_actual.weekday() < 5:  # lunes a viernes
                for empleado in empleados:
                    hora_entrada = time(8, 0)
                    hora_salida = time(16, 0)
                    horas_trabajadas = Decimal('8.00')
                    tiene_horas_extras = False
                    extra_hours = 0

                    if random.random() < 0.25:
                        extra_hours = random.randint(1, 3)
                        salida_dt = datetime.combine(fecha_actual, hora_salida) + timedelta(hours=extra_hours)
                        hora_salida = salida_dt.time()
                        horas_trabajadas += Decimal(extra_hours)
                        tiene_horas_extras = True

                    try:
                        asistencia_obj, created = Asistencia.objects.get_or_create(
                            empleado=empleado,
                            empresa=empresa,
                            fecha=fecha_actual,
                            defaults={
                                'hora_entrada': hora_entrada,
                                'hora_salida': hora_salida,
                                'horas_trabajadas': horas_trabajadas,
                                'observaciones': ''
                            }
                        )
                        if created:
                            self.stdout.write(self.style.SUCCESS(
                                f'✅ Asistencia creada: {empleado.nombre} {fecha_actual}'
                            ))
                        else:
                            self.stdout.write(self.style.WARNING(
                                f'⚠ Asistencia ya existe: {empleado.nombre} {fecha_actual}'
                            ))
                    except IntegrityError:
                        self.stdout.write(self.style.WARNING(
                            f'⚠ Asistencia duplicada detectada y evitada: {empleado.nombre} {fecha_actual}'
                        ))
                        continue

                    if created and tiene_horas_extras:
                        aprobador_rel = aprobadores.filter(departamento=empleado.departamento_del_empleado()).first()
                        HorasExtras.objects.create(
                            cantidad_horas_extra_trabajadas=timedelta(hours=extra_hours),
                            estado='PAGADO',
                            aprobado=True,
                            motivo="Trabajo tiempo extra",
                            empleado_autorizador=aprobador_rel.empleado if aprobador_rel else None,
                            empleado_solicitador=empleado,
                            empresa=empresa,
                            fecha_solicitud=datetime.combine(fecha_actual, time(16, 0)),
                            fecha_autorizacion=datetime.combine(fecha_actual, time(16, 30))
                        )
                        self.stdout.write(self.style.WARNING(
                            f'    Horas extras: {extra_hours}h aprobadas'
                        ))
            fecha_actual += timedelta(days=1)
