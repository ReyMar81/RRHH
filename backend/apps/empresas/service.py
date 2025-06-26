from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from apps.empresas.models import Empresa
from security.models import Usuario
from apps.suscripciones.models import Plan, Suscripcion

def crear_empresa_con_admin(data):
    nombre_empresa = data['nombre']
    email_admin = data['email_admin']
    username_admin = data.get('username_admin', nombre_empresa.lower().replace(' ', '_'))
    password = f"{nombre_empresa.lower().replace(' ', '')}2025"

    # Crear empresa
    empresa = Empresa.objects.create(
        nombre=nombre_empresa,
        direccion=data.get('direccion', ''),
        pais=data.get('BOL', ''),
        telefono=data.get('telefono', ''),
        email=email_admin
        # ...otros campos si es necesario
    )

    # Crear usuario admin
    user = Usuario.objects.create_user(
        username=username_admin,
        email=email_admin,
        password=password,
        empresa=empresa,
        is_staff=True
    )

    # Asignar suscripción según plan_id o prueba por defecto
    plan = data.get('plan_id')
    if plan:
        Suscripcion.objects.create(empresa=empresa, plan=plan)
    else:
        plan_trial = Plan.objects.filter(nombre__icontains='prueba').first()
        if plan_trial:
            Suscripcion.objects.create(empresa=empresa, plan=plan_trial)

    # Enviar email con credenciales
    send_mail(
        subject='Bienvenido a RRHH SaaS',
        message=f"Usuario: {username_admin}\nContraseña: {password}\nAcceso: https://tu-saas.com/login",
        from_email='hrmsystem2000@gmail.com',
        recipient_list=[email_admin],
        fail_silently=False,
    )

    print(f"[EMPRESA CREADA] {username_admin} / {password}")

    return empresa, user, password
