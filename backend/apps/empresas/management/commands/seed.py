from django.core.management.base import BaseCommand
from apps.departamento.models import Departamento
from apps.cargo.models import Cargo
from apps.cargo_departamento.models import CargoDepartamento
from apps.contrato.models import Contrato
from faker import Faker
from decimal import Decimal
from datetime import date, timedelta, time
import random

from apps.empleado.service import crear_empleado_con_usuario
from apps.empresas.service import crear_empresa_con_admin
from apps.suscripciones.models import Plan

class Command(BaseCommand):
    help = 'Seed para empresa mediana con contratos variados y estado ACTIVO'

    def handle(self, *args, **kwargs):
        fake = Faker()

        plan = Plan.objects.order_by('?').first()
        if not plan:
            self.stdout.write(self.style.ERROR('❌ No hay planes registrados.'))
            return

        data = {
            'nombre': 'Empresa Mediana',
            'email_admin': 'admin@empresamediana.com',
            'direccion': fake.address(),
            'telefono': fake.phone_number()[:20],
            'plan_id': plan,
            'pais': 'BOL',
            'autorizaHorasExtra': False
        }

        empresa, user, password = crear_empresa_con_admin(data)

        self.stdout.write(self.style.SUCCESS(f'✅ Empresa: {empresa.nombre}'))
        self.stdout.write(self.style.WARNING(f'    Usuario admin: {user.username}'))
        self.stdout.write(self.style.WARNING(f'    Password admin: {password}'))

        deptos_info = [
            'Recursos Humanos', 'Tecnología', 'Finanzas', 'Marketing',
            'Ventas', 'Operaciones', 'Logística', 'Atención al Cliente',
            'Compras', 'Legal'
        ]
        departamentos = {}
        for nombre in deptos_info:
            dep = Departamento.objects.create(
                nombre=nombre,
                descripcion=fake.sentence(),
                empresa=empresa
            )
            departamentos[nombre] = dep
            self.stdout.write(self.style.SUCCESS(f'✅ Departamento creado: {nombre}'))

        cargos_info = [
            ('Analista RRHH', 'mensual', 500, 'Recursos Humanos', 2),
            ('Reclutador', 'mensual', 450, 'Recursos Humanos', 2),
            ('Desarrollador Backend', 'mensual', 700, 'Tecnología', 3),
            ('Desarrollador Frontend', 'mensual', 700, 'Tecnología', 3),
            ('Soporte TI', 'mensual', 500, 'Tecnología', 2),
            ('Contador', 'mensual', 600, 'Finanzas', 2),
            ('Asistente Contable', 'mensual', 450, 'Finanzas', 2),
            ('Diseñador Gráfico', 'mensual', 550, 'Marketing', 2),
            ('Community Manager', 'mensual', 500, 'Marketing', 2),
            ('Ejecutivo de Ventas', 'mensual', 550, 'Ventas', 3),
            ('Supervisor de Operaciones', 'mensual', 600, 'Operaciones', 2),
            ('Operario', 'mensual', 400, 'Operaciones', 4),
            ('Coordinador Logística', 'mensual', 550, 'Logística', 1),
            ('Asistente Compras', 'mensual', 450, 'Compras', 1),
            ('Abogado Corporativo', 'mensual', 700, 'Legal', 1)
        ]

        cargo_deps = []
        for nombre, tipo_pago, salario, dep_nombre, cantidad in cargos_info:
            cargo = Cargo.objects.create(
                nombre=nombre,
                tipo_pago=tipo_pago,
                salario=Decimal(salario),
                receso_diario=Decimal('1.00'),
                horario_inicio=time(8, 0),
                horario_fin=time(16, 0),
                empresa=empresa
            )
            dep = departamentos[dep_nombre]
            cargo_dep = CargoDepartamento.objects.create(
                id_cargo=cargo,
                id_departamento=dep,
                empresa=empresa
            )
            cargo_deps.append((cargo_dep, cantidad))
            self.stdout.write(self.style.SUCCESS(f'✅ Cargo {nombre} relacionado con {dep_nombre}'))

        for cargo_dep, cantidad in cargo_deps:
            for _ in range(cantidad):
                data_empleado = {
                    'ci': fake.unique.random_number(digits=8, fix_len=True),
                    'nombre': fake.first_name(),
                    'apellidos': fake.last_name(),
                    'direccion': fake.address(),
                    'telefono': fake.phone_number()[:20],
                    'correo_personal': fake.email(),
                }

                empleado, username, emp_password = crear_empleado_con_usuario(data_empleado, empresa=empresa)

                self.stdout.write(self.style.SUCCESS(f'✅ Empleado creado: {empleado.nombre} {empleado.apellidos}'))
                self.stdout.write(self.style.WARNING(f'    Usuario: {username}'))
                self.stdout.write(self.style.WARNING(f'    Password: {emp_password}'))

                tipo_contrato = random.choices(
                    ['INDEFINIDO', 'PLAZO FIJO', 'MEDIO TIEMPO', 'PASANTIA'],
                    weights=[0.5, 0.3, 0.15, 0.05]
                )[0]
                estado_contrato = 'ACTIVO'
                fecha_inicio = date.today() - timedelta(days=random.randint(30, 365))

                if tipo_contrato == 'INDEFINIDO':
                    fecha_fin = None
                else:
                    fecha_fin = fecha_inicio + timedelta(days=random.randint(90, 365))

                Contrato.objects.create(
                    tipo_contrato=tipo_contrato,
                    fecha_inicio=fecha_inicio,
                    fecha_fin=fecha_fin,
                    estado=estado_contrato,
                    empleado=empleado,
                    cargo_departamento=cargo_dep,
                    empresa=empresa
                )

                self.stdout.write(self.style.SUCCESS(
                    f'    Contrato: {tipo_contrato}, Estado: {estado_contrato}, Departamento: {cargo_dep.id_departamento.nombre}, Cargo: {cargo_dep.id_cargo.nombre}'
                ))
