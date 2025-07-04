from django.contrib.auth import get_user_model
User = get_user_model()
from django.contrib.auth import authenticate
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from .models import Empleado

def crear_empleado_con_usuario(data, empresa=None):
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
        empresa=empresa
    )

    empleado_data = data.copy()
    if empresa is not None:
        empleado_data['empresa'] = empresa

    empleado = Empleado.objects.create(user_id=user, **empleado_data)

    if empleado.correo_personal:
        send_mail(
            subject='Tu cuenta ha sido creada',
            message=f"Usuario: {username}\nContraseña: {password}",
            from_email='hrmsystem2000@gmail.com',
            recipient_list=[empleado.correo_personal],
            fail_silently=False,
        )

    print(f"[EMPELADO CREADO] {username} / {password}")
    return empleado, username, password

def iniciales(apellidos: str):
    return ''.join(a[0].upper() for a in apellidos.split())

# Cambiar la contraseña de un empleado
def cambiar_password_con_validacion(empleado_id, actual_password, nueva_password):
    try:
        empleado = Empleado.objects.get(id=empleado_id)
        usuario = empleado.user_id

        # Verificar si es su primer ingreso (cambio forzado)
        if usuario.cambio_password_pendiente:
            # Saltamos validación de contraseña actual
            usuario.set_password(nueva_password)
            usuario.cambio_password_pendiente = False
            usuario.save()
            return True, "Contraseña establecida en el primer ingreso"
        else:
            # Verificar la contraseña actual normalmente
            usuario_autenticado = authenticate(username=usuario.username, password=actual_password)
            if not usuario_autenticado:
                return False, "Contraseña actual incorrecta"

            usuario.set_password(nueva_password)
            usuario.save()
            return True, "Contraseña actualizada correctamente"

    except Empleado.DoesNotExist:
        return False, "Empleado no encontrado"