from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from .models import Empleado

def crear_empleado_con_usuario(data):
    ci = data['ci']
    apellidos = data['apellidos']
    username = f"{ci}.{iniciales(apellidos)}"
    email = f"{username}@rrhh.com"
    password = get_random_string(12)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=data['nombre'],
        last_name=apellidos,
    )

    empleado = Empleado.objects.create(user_id=user, **data)

    if empleado.correo_personal:
        send_mail(
            subject='Tu cuenta ha sido creada',
            message=f"Usuario: {username}\nContraseña: {password}",
            from_email='no-reply@miempresa.com',
            recipient_list=[empleado.correo_personal],
            fail_silently=False,
        )

    print(f"[CREADO] {username} / {password}")
    return empleado, username, password

def iniciales(apellidos: str):
    return ''.join(a[0].upper() for a in apellidos.split())
