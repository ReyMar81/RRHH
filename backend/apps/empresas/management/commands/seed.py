from django.core.management.base import BaseCommand

from apps.categoria.models import Categoria
from apps.departamento.models import Departamento
from apps.cargo.models import Cargo
from apps.cargo_departamento.models import CargoDepartamento
from apps.contrato.models import Contrato
from apps.empleado.models import Empleado
from apps.empresas.service import crear_empresa_con_admin
from apps.empleado.service import crear_empleado_con_usuario
from apps.evaluacion.models import CriterioEvaluacion
from apps.horas_extras.models import Aprobadores
from apps.suscripciones.models import Plan
from django.contrib.auth.models import Group, Permission
from decimal import Decimal
from datetime import time, date, timedelta
from faker import Faker
import random

from apps.tipo.models import Tipo


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
                'telefono': '+591' + ''.join([str(random.randint(0, 9)) for _ in range(8)]),
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

            self.crear_tipos_y_categorias_documentos(empresa)
            self.crear_criterios_evaluacion(empresa)

            resumen = [f'\n🔐 Credenciales para {empresa.nombre}:']
            resumen.append(f'    Admin      -> {admin_user.username} / {admin_pass}')
            if supervisores and empleados:
                for sup, sup_user, sup_pwd in supervisores:
                    contrato_sup = Contrato.objects.filter(empleado=sup, estado='ACTIVO').first()
                    if not contrato_sup:
                        continue
                    departamento_sup = contrato_sup.cargo_departamento.id_departamento

                    for emp, emp_user, emp_pwd in empleados:
                        contrato_emp = Contrato.objects.filter(empleado=emp, estado='ACTIVO').first()
                        if contrato_emp and contrato_emp.cargo_departamento.id_departamento == departamento_sup:
                            resumen.append(f'    Supervisor -> {sup_user} / {sup_pwd} - {sup.nombre} {sup.apellidos}')
                            resumen.append(f'                 Cargo: {contrato_sup.cargo_departamento.id_cargo.nombre} | Departamento: {departamento_sup.nombre}')
                            resumen.append(f'    Empleado   -> {emp_user} / {emp_pwd} - {emp.nombre} {emp.apellidos}')
                            resumen.append(f'                 Cargo: {contrato_emp.cargo_departamento.id_cargo.nombre} | Departamento: {departamento_sup.nombre}')
                            break
                    else:
                        continue
                    break

            resumen_credenciales.append('\n'.join(resumen))

        # ✅ Mostrar todo el resumen al final
        self.stdout.write(self.style.SUCCESS('\n===== RESUMEN DE CREDENCIALES ====='))
        for r in resumen_credenciales:
            self.stdout.write(self.style.WARNING(r))

    def crear_datos_para_empresa(self, empresa, admin_user, admin_pass, fake, crear_contratos_finalizados):
        from datetime import timedelta

        departamentos_nombres = ['Administración', 'Producción', 'Ventas', 'RRHH']
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
                'fecha_nacimiento': date.today() - timedelta(days=random.randint(20 * 365, 60 * 365)),
                'genero': genero,
                'estado_civil': random.choice(['S', 'C', 'V']),
                'direccion': fake.address(),
                'telefono': '+591' + ''.join([str(random.randint(0, 9)) for _ in range(8)]),
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

            # Evaluación: indefinido = 6 meses
            fecha_inicio = date.today() - timedelta(days=180)
            evaluacion_periodicidad = timedelta(days=180)
            ultima_evaluacion = fecha_inicio + evaluacion_periodicidad

            Contrato.objects.create(
                tipo_contrato='INDEFINIDO',
                fecha_inicio=fecha_inicio,
                fecha_fin=None,
                estado='ACTIVO',
                empleado=supervisor,
                cargo_departamento=cargo_dep,
                empresa=empresa,
                evaluacion_periodicidad=evaluacion_periodicidad,
                ultima_evaluacion_programada=ultima_evaluacion
            )

            Aprobadores.objects.create(
                empleado=supervisor,
                departamento=dep,
                empresa=empresa,
                encargado_de='evaluacion'
            )

        cargos_info = [
            ('Operario', 'mensual', 3500, 'Producción', 2),
            ('Vendedor', 'mensual', 4000, 'Ventas', 2),
            ('Asistente Administrativo', 'mensual', 3800, 'Administración', 1),
            ('Analista RRHH', 'mensual', 4500, 'RRHH', 2)
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
                    'fecha_nacimiento': date.today() - timedelta(days=random.randint(20 * 365, 60 * 365)),
                    'genero': genero,
                    'estado_civil': random.choice(['S', 'C', 'V']),
                    'direccion': fake.address(),
                    'telefono': '+591' + ''.join([str(random.randint(0, 9)) for _ in range(8)]),
                    'correo_personal': fake.email(),
                    'cuenta_bancaria': cuenta_bancaria
                }

                empleado, username, password = crear_empleado_con_usuario(data_emp, empresa=empresa)
                empleado.user_id.groups.add(grupo_empleado)
                empleados_creados.append((empleado, username, password))

                tipo_contrato = random.choice(['PLAZO FIJO', 'MEDIO TIEMPO'])
                fecha_inicio = date.today() - timedelta(days=random.randint(30, 180))
                fecha_fin = fecha_inicio + timedelta(days=3 * 365)
                evaluacion_periodicidad = timedelta(days=180)
                ultima_evaluacion = fecha_inicio + evaluacion_periodicidad

                Contrato.objects.create(
                    tipo_contrato=tipo_contrato,
                    fecha_inicio=fecha_inicio,
                    fecha_fin=fecha_fin,
                    estado='ACTIVO',
                    empleado=empleado,
                    cargo_departamento=cargo_dep,
                    empresa=empresa,
                    evaluacion_periodicidad=evaluacion_periodicidad,
                    ultima_evaluacion_programada=ultima_evaluacion
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
                    'fecha_nacimiento': date.today() - timedelta(days=random.randint(20 * 365, 60 * 365)),
                    'genero': genero,
                    'estado_civil': random.choice(['S', 'C', 'V']),
                    'direccion': fake.address(),
                    'telefono': '+591' + ''.join([str(random.randint(0, 9)) for _ in range(8)]),
                    'correo_personal': fake.email(),
                    'cuenta_bancaria': cuenta_bancaria
                }

                empleado, username, password = crear_empleado_con_usuario(data_emp, empresa=empresa)
                empleado.user_id.groups.add(grupo_empleado)

                tipo_contrato = random.choice(tipos_contrato)
                fecha_inicio = date.today() - timedelta(days=random.randint(365, 1500))

                if tipo_contrato == 'INDEFINIDO':
                    fecha_fin = None
                    evaluacion_periodicidad = timedelta(days=180)
                elif tipo_contrato in ['PLAZO FIJO', 'MEDIO TIEMPO']:
                    fecha_fin = fecha_inicio + timedelta(days=3 * 365)
                    evaluacion_periodicidad = timedelta(days=180)
                elif tipo_contrato == 'PASANTIA':
                    fecha_fin = fecha_inicio + timedelta(days=random.randint(60, 180))
                    evaluacion_periodicidad = timedelta(days=30)

                ultima_evaluacion = fecha_inicio + evaluacion_periodicidad

                Contrato.objects.create(
                    tipo_contrato=tipo_contrato,
                    fecha_inicio=fecha_inicio,
                    fecha_fin=fecha_fin,
                    estado='FINALIZADO',
                    empleado=empleado,
                    cargo_departamento=random.choice(cargos_departamento),
                    empresa=empresa,
                    observaciones='Contrato concluido satisfactoriamente',
                    evaluacion_periodicidad=evaluacion_periodicidad,
                    ultima_evaluacion_programada=ultima_evaluacion
                )

        return supervisores_creados, empleados_creados

    def crear_tipos_y_categorias_documentos(self, empresa):
        # Categorías comunes
        categorias_data = [
            {'nombre': 'Identificación', 'descripcion': 'Documentos personales de identidad'},
            {'nombre': 'Contrato', 'descripcion': 'Contratos laborales y anexos'},
            {'nombre': 'Evaluación', 'descripcion': 'Resultados y formularios de evaluación'},
            {'nombre': 'Capacitación', 'descripcion': 'Certificados y registros de capacitación'}
        ]

        for cat in categorias_data:
            Categoria.objects.get_or_create(
                nombre=cat['nombre'],
                empresa=empresa,
                defaults={'descripcion': cat['descripcion']}
            )

        # Tipos comunes
        tipos_data = [
            {'nombre': 'CI (Carnet de Identidad)', 'descripcion': 'Fotocopia del documento de identidad',
             'es_requerido': True},
            {'nombre': 'Certificado de Nacimiento', 'descripcion': '', 'es_requerido': True},
            {'nombre': 'Contrato Individual', 'descripcion': 'Contrato firmado por ambas partes', 'es_requerido': True},
            {'nombre': 'Evaluación de Desempeño', 'descripcion': 'Formato anual de evaluación', 'es_requerido': False},
            {'nombre': 'Certificado de Curso', 'descripcion': 'Certificados de formación interna o externa',
             'es_requerido': False}
        ]

        for tipo in tipos_data:
            Tipo.objects.get_or_create(
                nombre=tipo['nombre'],
                empresa=empresa,
                defaults={
                    'descripcion': tipo['descripcion'],
                    'es_requerido': tipo['es_requerido'],
                    'activo': True
                }
            )

    def crear_criterios_evaluacion(self, empresa):
        criterios = [
            {'nombre': 'Desempeño laboral', 'descripcion': 'Evaluación del rendimiento en el trabajo asignado'},
            {'nombre': 'Conocimientos y habilidades', 'descripcion': 'Nivel de conocimientos técnicos y competencias'},
            {'nombre': 'Responsabilidad y compromiso',
             'descripcion': 'Cumplimiento de deberes y nivel de involucramiento'},
            {'nombre': 'Adaptabilidad', 'descripcion': 'Capacidad para ajustarse a los cambios y nuevos entornos'}
        ]

        for crit in criterios:
            CriterioEvaluacion.objects.get_or_create(
                nombre=crit['nombre'],
                empresa=empresa,
                defaults={'descripcion': crit['descripcion']}
            )
