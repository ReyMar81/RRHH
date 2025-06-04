from apps.bitacora.models import Bitacora
from django.utils import timezone

def registrar_bitacora(empresa, usuario, accion, ip=None, detalles=None, fecha_maquina=None):
    Bitacora.objects.create(
        empresa=empresa,
        usuario=usuario,
        accion=accion,
        ip=ip,
        detalles=detalles,
        fecha_maquina=fecha_maquina,
        fecha_servidor=timezone.now(),
    )
