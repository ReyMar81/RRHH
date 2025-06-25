from django.core.management.base import BaseCommand
from apps.nomina.models import EstructuraSalarial, ReglaSalarial
from apps.empresas.models import Empresa
from apps.plantillas_nomina.models import EstructuraSalarialPlantilla, ReglaSalarialPlantilla, Pais

class Command(BaseCommand):
    help = 'Clona todas las estructuras salariales plantilla de Bolivia y sus reglas para la empresa seleccionada.'

    def handle(self, *args, **kwargs):
        empresa = Empresa.objects.first()
        if not empresa:
            self.stdout.write(self.style.ERROR("❌ No hay empresas registradas."))
            return

        pais_bol = Pais.objects.get(codigo='BOL')
        estructuras_plantilla = EstructuraSalarialPlantilla.objects.filter(pais=pais_bol)
        if not estructuras_plantilla.exists():
            self.stdout.write(self.style.ERROR("❌ No hay estructuras plantilla para Bolivia."))
            return

        for estructura_plantilla in estructuras_plantilla:
            estructura = EstructuraSalarial.objects.create(
                nombre=estructura_plantilla.nombre,
                descripcion=estructura_plantilla.descripcion,
                empresa=empresa,
                tipo_contrato=estructura_plantilla.tipo_contrato,
                pais=pais_bol.nombre,
                activa=True
            )
            self.stdout.write(self.style.SUCCESS(f"✅ Estructura clonada: {estructura.nombre}"))

            reglas_plantilla = ReglaSalarialPlantilla.objects.filter(estructura=estructura_plantilla)
            for regla in reglas_plantilla:
                ReglaSalarial.objects.create(
                    estructura=estructura,
                    nombre=regla.nombre,
                    codigo=regla.codigo,
                    tipo=regla.tipo,
                    secuencia=regla.secuencia,
                    condicion=regla.condicion,
                    formula=regla.formula,
                    empresa=empresa,
                    pais=pais_bol.nombre
                )
                self.stdout.write(self.style.SUCCESS(f"✅ Regla clonada: {regla.nombre} ({regla.tipo})"))
