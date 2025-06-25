from django.core.management.base import BaseCommand
from apps.asistencia.models import Asistencia
from apps.horas_extras.models import HorasExtras, Aprobadores
from apps.empleado.models import Empleado
from apps.empresas.models import Empresa
from apps.departamento.models import Departamento
from apps.contrato.models import Contrato
from datetime import datetime, timedelta, date, time
from decimal import Decimal
import random
from django.db import IntegrityError
from dateutil.relativedelta import relativedelta

class Command(BaseCommand):
    help = 'Genera asistencias y solicitudes de horas extras en Industrias Andinas, con supervisores por departamento'

    def handle(self, *args, **kwargs):
        nombre_empresa = 'Industrias Andinas'

        try:
            empresa = Empresa.objects.get(nombre=nombre_empresa)
        except Empresa.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'❌ Empresa no encontrada: {nombre_empresa}'))
            return

        empleados = Empleado.objects.filter(empresa=empresa)
        if not empleados.exists():
            self.stdout.write(self.style.ERROR(f'❌ No hay empleados en {nombre_empresa}'))
            return

        for departamento in Departamento.objects.filter(empresa=empresa):
            supervisor = Empleado.objects.filter(
                empresa=empresa,
                user_id__groups__name='Supervisor',
                contratos__cargo_departamento__id_departamento=departamento,
                contratos__estado='ACTIVO'
            ).distinct().first()

            if supervisor:
                Aprobadores.objects.get_or_create(
                    empleado=supervisor,
                    departamento=departamento,
                    empresa=empresa,
                    encargado_de='hora_extra'
                )

        fecha_fin = date.today()
        fecha_inicio = fecha_fin - relativedelta(months=2)
        fecha_actual = fecha_inicio

        while fecha_actual <= fecha_fin:
            if fecha_actual.weekday() < 5:
                for empleado in empleados:
                    contrato_activo = Contrato.objects.filter(
                        empleado=empleado,
                        estado__in=['ACTIVO', 'RENOVADO']
                    ).first()
                    contrato_finalizado = Contrato.objects.filter(
                        empleado=empleado,
                        estado='FINALIZADO',
                        fecha_fin__gte=fecha_inicio
                    ).first()

                    if not contrato_activo and not contrato_finalizado:
                        continue

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
                                'observaciones': 'Registro generado automáticamente'
                            }
                        )
                        if created:
                            self.stdout.write(self.style.SUCCESS(
                                f'✅ Asistencia: {empleado.nombre} {fecha_actual}'
                            ))
                        else:
                            self.stdout.write(self.style.WARNING(
                                f'⚠ Ya existía asistencia: {empleado.nombre} {fecha_actual}'
                            ))
                    except IntegrityError:
                        self.stdout.write(self.style.WARNING(
                            f'⚠ Asistencia duplicada evitada: {empleado.nombre} {fecha_actual}'
                        ))
                        continue

                    if created and tiene_horas_extras:
                        duracion = timedelta(hours=extra_hours)
                        departamento = empleado.departamento_del_empleado()
                        aprobador_rel = Aprobadores.objects.filter(
                            empresa=empresa,
                            departamento=departamento,
                            encargado_de='hora_extra'
                        ).first()

                        es_reciente = fecha_actual >= (date.today() - timedelta(days=2))
                        fue_aprobada = random.random() < 0.6 if not es_reciente else False

                        if fue_aprobada and aprobador_rel:
                            empleado_autorizador = aprobador_rel.empleado
                            fecha_autorizacion = datetime.combine(fecha_actual, time(16, 30))
                            aprobado = True
                        else:
                            empleado_autorizador = None
                            fecha_autorizacion = None
                            aprobado = False

                        if aprobado and (not empleado_autorizador or not fecha_autorizacion):
                            raise ValueError(f"Horas extra aprobada sin autorizador o fecha para {empleado.nombre}")

                        HorasExtras.objects.create(
                            cantidad_horas_extra_trabajadas=duracion,
                            cantidad_horas_extra_solicitadas=duracion,
                            estado='IMPAGO',
                            aprobado=aprobado,
                            motivo="Trabajo tiempo extra",
                            empleado_autorizador=empleado_autorizador,
                            empleado_solicitador=empleado,
                            empresa=empresa,
                            fecha_solicitud=datetime.combine(fecha_actual, time(16, 0)),
                            fecha_autorizacion=fecha_autorizacion
                        )

                        if es_reciente:
                            msg = f'    ⏳ Horas extras: {extra_hours}h solicitadas (pendiente de aprobación)'
                        elif fue_aprobada:
                            if empleado_autorizador:
                                msg = f'    ✅ Horas extras: {extra_hours}h aprobadas por {empleado_autorizador.nombre}'
                            else:
                                msg = f'    ✅ Horas extras: {extra_hours}h aprobadas (sin autorizador registrado)'
                        else:
                            msg = f'    ❌ Horas extras: {extra_hours}h rechazadas'
                        self.stdout.write(self.style.WARNING(msg))
            fecha_actual += timedelta(days=1)
