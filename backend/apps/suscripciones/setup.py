from django.db import transaction
from django.contrib.auth.models import Permission
from .models import Plan, Planes_Privilegios

# Privilegios por plan (codename de permisos estándar de Django)
PRIVILEGIOS_PLANES = {
    'Prueba 14 días': '__all__',  # Todos los permisos
    'Básico': [
        'view_empleado', 'add_empleado', 'change_empleado', 'delete_empleado',
        'view_asistencia', 'add_asistencia', 'change_asistencia', 'delete_asistencia',
        'view_documento', 'add_documento', 'change_documento', 'delete_documento',
    ],
    'Profesional': [
        'view_empleado', 'add_empleado', 'change_empleado', 'delete_empleado',
        'view_asistencia', 'add_asistencia', 'change_asistencia', 'delete_asistencia',
        'view_documento', 'add_documento', 'change_documento', 'delete_documento',
        'view_reporte', 'add_reporte', 'change_reporte', 'delete_reporte',
        'exportar_datos',
    ],
    'Empresarial': '__all__',  # Todos los permisos
}

@transaction.atomic
def crear_planes_y_privilegios():
    planes = [
        {'nombre': 'Prueba 14 días', 'tipo_de_duracion': 'd', 'cantidad_duracion': '14', 'precio': 0},
        {'nombre': 'Básico', 'tipo_de_duracion': 'm', 'cantidad_duracion': '1', 'precio': 30},
        {'nombre': 'Profesional', 'tipo_de_duracion': 'm', 'cantidad_duracion': '1', 'precio': 60},
        {'nombre': 'Empresarial', 'tipo_de_duracion': 'm', 'cantidad_duracion': '1', 'precio': 120},
    ]
    for plan_data in planes:
        plan, created = Plan.objects.get_or_create(
            nombre=plan_data['nombre'],
            defaults={
                'tipo_de_duracion': plan_data['tipo_de_duracion'],
                'cantidad_duracion': plan_data['cantidad_duracion'],
                'precio': plan_data['precio']
            }
        )
        # Asignar privilegios
        privilegios = PRIVILEGIOS_PLANES[plan.nombre]
        if privilegios == '__all__':
            permisos = Permission.objects.all()
        else:
            permisos = Permission.objects.filter(codename__in=privilegios)
        for permiso in permisos:
            Planes_Privilegios.objects.get_or_create(plan=plan, privilegio=permiso)
