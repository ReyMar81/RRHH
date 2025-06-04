from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from apps.empresas.models import Empresa
from security.models import Usuario

def crear_empresa_con_admin(data):
    nombre_empresa = data['nombre']
    email_admin = data['email_admin']
    username_admin = data.get('username_admin', nombre_empresa.lower().replace(' ', '_'))
    password = f"{nombre_empresa.lower().replace(' ', '')}2025"

    # Crear empresa
    empresa = Empresa.objects.create(
        nombre=nombre_empresa,
        direccion=data.get('direccion', ''),
        telefono=data.get('telefono', ''),
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

    # Enviar email con credenciales
    send_mail(
        subject='Bienvenido a RRHH SaaS',
        message=f"Usuario: {username_admin}\nContraseña: {password}\nAcceso: https://tu-saas.com/login",
        from_email='no-reply@tu-saas.com',
        recipient_list=[email_admin],
        fail_silently=False,
    )

    return empresa, user, password
