from django.core.management.base import BaseCommand
from apps.nomina.models import EstructuraSalarial, ReglaSalarial
from apps.empresas.models import Empresa

class Command(BaseCommand):
    help = 'Crea estructuras salariales y reglas salariales para la nómina de la empresa'

    def handle(self, *args, **kwargs):
        empresa = Empresa.objects.first()

        if not empresa:
            self.stdout.write(self.style.ERROR("❌ No hay empresas registradas."))
            return

        estructura = EstructuraSalarial.objects.create(
            nombre="Mensual General",
            descripcion="Estructura salarial para contratos mensuales en Bolivia.",
            empresa=empresa,
            tipo_contrato="INDEFINIDO",
            pais="BOL",
            activa=True
        )

        self.stdout.write(self.style.SUCCESS(f"✅ Estructura creada: {estructura.nombre}"))

        reglas = [
            {
                'nombre': 'Sueldo Básico',
                'codigo': 'BASICO',
                'tipo': 'ingreso',
                'secuencia': 10,
                'condicion': 'True',
                'formula': 'contrato.salario_personalizado or contrato.id_cargo.salario',
            },
            {
                'nombre': 'AFP',
                'codigo': 'AFP',
                'tipo': 'deduccion',
                'secuencia': 20,
                'condicion': 'True',
                'formula': '(salario_base) * 0.1271',
            },
            {
                'nombre': 'Bono Antigüedad',
                'codigo': 'BONO_ANTIG',
                'tipo': 'bono',
                'secuencia': 30,
                'condicion': '(hoy - contrato.fecha_inicio).days // 365 >= 2',
                'formula': '(salario_base) * 0.05',
            },
            {
                'nombre': 'Hora Extra',
                'codigo': 'HORA_EXTRA',
                'tipo': 'hora_extra',
                'secuencia': 40,
                'condicion': 'horas_extra_totales > 0',
                'formula': 'horas_extra_totales * (salario_base / 160) * 2',
            }
        ]

        for regla_data in reglas:
            regla = ReglaSalarial.objects.create(
                estructura=estructura,
                nombre=regla_data['nombre'],
                codigo=regla_data['codigo'],
                tipo=regla_data['tipo'],
                secuencia=regla_data['secuencia'],
                condicion=regla_data['condicion'],
                formula=regla_data['formula'],
                empresa=empresa,
                pais="BOL"
            )
            self.stdout.write(self.style.SUCCESS(f"✅ Regla creada: {regla.nombre} ({regla.tipo})"))
