from django.core.management.base import BaseCommand
from apps.plantillas_nomina.models import Pais, EstructuraSalarialPlantilla, ReglaSalarialPlantilla
from decimal import Decimal

class Command(BaseCommand):
    help = 'Crea países, estructuras salariales plantilla y reglas plantilla para varios países.'

    def handle(self, *args, **kwargs):
        # Crear países
        paises_data = [
            {'codigo': 'BOL', 'nombre': 'Bolivia'},
            {'codigo': 'ARG', 'nombre': 'Argentina'},
            {'codigo': 'MEX', 'nombre': 'México'},
        ]
        tipos_contrato = [
            'INDEFINIDO',
            'PLAZO FIJO',
            'MEDIO TIEMPO',
            'PASANTIA',
        ]
        pais_objs = {}
        for p in paises_data:
            pais, _ = Pais.objects.get_or_create(codigo=p['codigo'], defaults={'nombre': p['nombre']})
            pais_objs[p['codigo']] = pais
            self.stdout.write(self.style.SUCCESS(f"✅ País creado: {pais.nombre}"))

        # Reglas por país
        reglas_por_pais = {
            'BOL': [
                {
                    'nombre': 'Sueldo Básico',
                    'codigo': 'BASICO',
                    'tipo': 'ingreso',
                    'secuencia': 10,
                    'condicion': 'True',
                    'formula': 'contrato.salario_personalizado or contrato.cargo_departamento.id_cargo.salario',
                },
                {
                    'nombre': 'AFP',
                    'codigo': 'AFP',
                    'tipo': 'deduccion',
                    'secuencia': 20,
                    'condicion': 'True',
                    'formula': '(salario_base) * Decimal("0.1271")',
                },
                {
                    'nombre': 'Bono Antigüedad',
                    'codigo': 'BONO_ANTIG',
                    'tipo': 'bono',
                    'secuencia': 30,
                    'condicion': '(hoy - contrato.fecha_inicio).days // 365 >= 2',
                    'formula': '(salario_base) * Decimal("0.05")',
                },
                {
                    'nombre': 'Hora Extra',
                    'codigo': 'HORA_EXTRA',
                    'tipo': 'hora_extra',
                    'secuencia': 40,
                    'condicion': 'horas_extra_totales > 0',
                    'formula': 'horas_extra_totales * (salario_base / Decimal("160")) * Decimal("2")',
                },
                {
                    'nombre': 'Descuento por Faltas',
                    'codigo': 'FALTAS',
                    'tipo': 'deduccion',
                    'secuencia': 15,
                    'condicion': 'dias_faltados > 0',
                    'formula': '(salario_base / Decimal("{0}".format(dias_periodo))) * dias_faltados',
                },
            ],
            'ARG': [
                {
                    'nombre': 'Sueldo Básico',
                    'codigo': 'BASICO',
                    'tipo': 'ingreso',
                    'secuencia': 10,
                    'condicion': 'True',
                    'formula': 'contrato.salario_personalizado or contrato.cargo_departamento.id_cargo.salario',
                },
                {
                    'nombre': 'Jubilación',
                    'codigo': 'JUBILACION',
                    'tipo': 'deduccion',
                    'secuencia': 20,
                    'condicion': 'True',
                    'formula': '(salario_base) * Decimal("0.11")',
                },
                {
                    'nombre': 'Obra Social',
                    'codigo': 'OBRA_SOCIAL',
                    'tipo': 'deduccion',
                    'secuencia': 30,
                    'condicion': 'True',
                    'formula': '(salario_base) * Decimal("0.03")',
                },
            ],
            'MEX': [
                {
                    'nombre': 'Sueldo Base',
                    'codigo': 'BASE',
                    'tipo': 'ingreso',
                    'secuencia': 10,
                    'condicion': 'True',
                    'formula': 'contrato.salario_personalizado or contrato.cargo_departamento.id_cargo.salario',
                },
                {
                    'nombre': 'IMSS',
                    'codigo': 'IMSS',
                    'tipo': 'deduccion',
                    'secuencia': 20,
                    'condicion': 'True',
                    'formula': '(salario_base) * Decimal("0.0625")',
                },
                {
                    'nombre': 'ISR',
                    'codigo': 'ISR',
                    'tipo': 'deduccion',
                    'secuencia': 30,
                    'condicion': 'True',
                    'formula': '(salario_base) * Decimal("0.10")',
                },
            ],
        }

        for codigo_pais, reglas in reglas_por_pais.items():
            pais = pais_objs[codigo_pais]
            for tipo_contrato in tipos_contrato:
                estructura_nombre = f"Mensual General {pais.nombre} - {tipo_contrato}"
                estructura, _ = EstructuraSalarialPlantilla.objects.get_or_create(
                    nombre=estructura_nombre,
                    pais=pais,
                    tipo_contrato=tipo_contrato,
                    defaults={'descripcion': f"Estructura salarial para {pais.nombre} ({tipo_contrato})", 'activa': True}
                )
                for regla in reglas:
                    ReglaSalarialPlantilla.objects.get_or_create(
                        estructura=estructura,
                        nombre=regla['nombre'],
                        codigo=regla['codigo'],
                        tipo=regla['tipo'],
                        secuencia=regla['secuencia'],
                        condicion=regla['condicion'],
                        formula=regla['formula'],
                        pais=pais
                    )
                self.stdout.write(self.style.SUCCESS(f"✅ Plantilla {pais.nombre} - {tipo_contrato} lista"))
