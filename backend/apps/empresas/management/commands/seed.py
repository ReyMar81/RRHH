from django.core.management.base import BaseCommand
from apps.departamento.models import Departamento
from apps.cargo.models import Cargo
from apps.cargo_departamento.models import CargoDepartamento
from apps.contrato.models import Contrato
from apps.empleado.models import Empleado
from apps.empresas.service import crear_empresa_con_admin
from apps.empleado.service import crear_empleado_con_usuario
from apps.suscripciones.models import Plan
from django.contrib.auth.models import Group, Permission
from decimal import Decimal
from datetime import time, date, timedelta
from faker import Faker
import random

class Command(BaseCommand):
    help = 'Seed para empresas pequeñas con empleados activos y finalizados'

    def handle(self, *args, **kwargs):
        fake = Faker('es_ES')
        plan = Plan.objects.order_by('?').first()
        if not plan:
            self.stdout.write(self.style.ERROR('❌ No hay planes registrados.'))
            return

        empresas_datos = [
            {
                'nombre': 'Textiles El Valle',
                'email_admin': 'admin@textileselvalle.com',
                'autorizaHorasExtra': False,
                'crear_contratos_finalizados': False
            },
            {
                'nombre': 'Industrias Andinas',
                'email_admin': 'admin@industriasandinas.com',
                'autorizaHorasExtra': True,
                'crear_contratos_finalizados': True
            }
        ]

        resumen_credenciales = []

        for datos in empresas_datos:
            data_empresa = {
                'nombre': datos['nombre'],
                'email_admin': datos['email_admin'],
                'direccion': fake.address(),
                'telefono': fake.phone_number()[:20],
                'plan_id': plan,
                'pais': 'BOL',
                'autorizaHorasExtra': True
            }

            empresa, admin_user, admin_pass = crear_empresa_con_admin(data_empresa)
            empresa.autorizaHorasExtra = datos['autorizaHorasExtra']
            empresa.save()

            supervisores, empleados = self.crear_datos_para_empresa(
                empresa, admin_user, admin_pass, fake, datos['crear_contratos_finalizados']
            )

            resumen = [f'\n🔐 Credenciales para {empresa.nombre}:']
            resumen.append(f'    Admin      -> {admin_user.username} / {admin_pass}')
            if supervisores:
                sup, user, pwd = supervisores[0]
                resumen.append(f'    Supervisor -> {user} / {pwd} - {sup.nombre} {sup.apellidos}')
            if empleados:
                emp, user, pwd = empleados[0]
                resumen.append(f'    Empleado   -> {user} / {pwd} - {emp.nombre} {emp.apellidos}')
            resumen_credenciales.append('\n'.join(resumen))

        self.stdout.write(self.style.SUCCESS('\n===== RESUMEN DE CREDENCIALES ====='))
        for r in resumen_credenciales:
            self.stdout.write(self.style.WARNING(r))

    def crear_datos_para_empresa(self, empresa, admin_user, admin_pass, fake, crear_contratos_finalizados):
        departamentos_nombres = ['Administración', 'Producción', 'Ventas']
        departamentos = {}
        for nombre in departamentos_nombres:
            dep = Departamento.objects.create(nombre=nombre, descripcion=fake.sentence(), empresa=empresa)
            departamentos[nombre] = dep

        grupo_supervisor, _ = Group.objects.get_or_create(name='Supervisor')
        grupo_empleado, _ = Group.objects.get_or_create(name='Empleado')

        if not grupo_supervisor.permissions.exists():
            grupo_supervisor.permissions.set(Permission.objects.all())

        if not grupo_empleado.permissions.exists():
            grupo_empleado.permissions.set(Permission.objects.filter(codename__startswith='view_'))

        cargo_supervisor = Cargo.objects.create(
            nombre='Supervisor',
            tipo_pago='mensual',
            salario=Decimal(7000),
            receso_diario=Decimal('1.00'),
            horario_inicio=time(8, 0),
            horario_fin=time(16, 0),
            empresa=empresa
        )

        supervisores_creados = []
        empleados_creados = []
        cargos_departamento = []

        for nombre_dep, dep in departamentos.items():
            genero = random.choice(['M', 'F'])
            nombre = fake.first_name_male() if genero == 'M' else fake.first_name_female()
            cuenta_bancaria = '0101' + ''.join([str(random.randint(0, 9)) for _ in range(14)])

            data_sup = {
                'ci': fake.unique.random_number(digits=8, fix_len=True),
                'nombre': nombre,
                'apellidos': fake.last_name(),
                'fecha_nacimiento': date.today() - timedelta(days=random.randint(20*365, 60*365)),
                'genero': genero,
                'estado_civil': random.choice(['S', 'C', 'V']),
                'direccion': fake.address(),
                'telefono': fake.phone_number()[:20],
                'correo_personal': fake.email(),
                'cuenta_bancaria': cuenta_bancaria
            }

            supervisor, username, password = crear_empleado_con_usuario(data_sup, empresa=empresa)
            supervisor.user_id.groups.add(grupo_supervisor)
            supervisores_creados.append((supervisor, username, password))

            cargo_dep = CargoDepartamento.objects.create(
                id_cargo=cargo_supervisor,
                id_departamento=dep,
                empresa=empresa
            )
            cargos_departamento.append(cargo_dep)

            Contrato.objects.create(
                tipo_contrato='INDEFINIDO',
                fecha_inicio=date.today() - timedelta(days=180),
                fecha_fin=None,
                estado='ACTIVO',
                empleado=supervisor,
                cargo_departamento=cargo_dep,
                empresa=empresa
            )

        cargos_info = [
            ('Operario', 'mensual', 3500, 'Producción', 2),
            ('Vendedor', 'mensual', 4000, 'Ventas', 2),
            ('Asistente Administrativo', 'mensual', 3800, 'Administración', 1)
        ]

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
            cargo_dep = CargoDepartamento.objects.create(
                id_cargo=cargo,
                id_departamento=departamentos[dep_nombre],
                empresa=empresa
            )
            cargos_departamento.append(cargo_dep)

            for _ in range(cantidad):
                genero = random.choice(['M', 'F'])
                nombre_emp = fake.first_name_male() if genero == 'M' else fake.first_name_female()
                cuenta_bancaria = '0101' + ''.join([str(random.randint(0, 9)) for _ in range(14)])

                data_emp = {
                    'ci': fake.unique.random_number(digits=8, fix_len=True),
                    'nombre': nombre_emp,
                    'apellidos': fake.last_name(),
                    'fecha_nacimiento': date.today() - timedelta(days=random.randint(20*365, 60*365)),
                    'genero': genero,
                    'estado_civil': random.choice(['S', 'C', 'V']),
                    'direccion': fake.address(),
                    'telefono': fake.phone_number()[:20],
                    'correo_personal': fake.email(),
                    'cuenta_bancaria': cuenta_bancaria
                }

                empleado, username, password = crear_empleado_con_usuario(data_emp, empresa=empresa)
                empleado.user_id.groups.add(grupo_empleado)
                empleados_creados.append((empleado, username, password))

                Contrato.objects.create(
                    tipo_contrato='PLAZO FIJO',
                    fecha_inicio=date.today() - timedelta(days=random.randint(30, 180)),
                    fecha_fin=date.today() + timedelta(days=random.randint(90, 180)),
                    estado='ACTIVO',
                    empleado=empleado,
                    cargo_departamento=cargo_dep,
                    empresa=empresa
                )

        if crear_contratos_finalizados:
            tipos_contrato = ['INDEFINIDO', 'PLAZO FIJO', 'MEDIO TIEMPO', 'PASANTIA']
            for _ in range(len(empleados_creados)):
                genero = random.choice(['M', 'F'])
                nombre_emp = fake.first_name_male() if genero == 'M' else fake.first_name_female()
                cuenta_bancaria = '0101' + ''.join([str(random.randint(0, 9)) for _ in range(14)])

                data_emp = {
                    'ci': fake.unique.random_number(digits=8, fix_len=True),
                    'nombre': nombre_emp,
                    'apellidos': fake.last_name(),
                    'fecha_nacimiento': date.today() - timedelta(days=random.randint(20*365, 60*365)),
                    'genero': genero,
                    'estado_civil': random.choice(['S', 'C', 'V']),
                    'direccion': fake.address(),
                    'telefono': fake.phone_number()[:20],
                    'correo_personal': fake.email(),
                    'cuenta_bancaria': cuenta_bancaria
                }

                empleado, username, password = crear_empleado_con_usuario(data_emp, empresa=empresa)
                empleado.user_id.groups.add(grupo_empleado)

                tipo_contrato = random.choice(tipos_contrato)
                fecha_inicio = date.today() - timedelta(days=random.randint(365, 1500))
                fecha_fin = fecha_inicio + timedelta(days=random.randint(180, 720))

                Contrato.objects.create(
                    tipo_contrato=tipo_contrato,
                    fecha_inicio=fecha_inicio,
                    fecha_fin=fecha_fin,
                    estado='FINALIZADO',
                    empleado=empleado,
                    cargo_departamento=random.choice(cargos_departamento),
                    empresa=empresa,
                    observaciones='Contrato concluido satisfactoriamente'
                )

        return supervisores_creados, empleados_creados
