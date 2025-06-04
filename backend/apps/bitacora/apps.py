from django.apps import AppConfig

class BitacoraConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.bitacora'

    def ready(self):
        from auditlog.registry import auditlog
        from apps.empleado.models import Empleado
        from apps.documento.models import Documento
        from apps.contrato.models import Contrato
        from apps.empresas.models import Empresa
        from apps.cargo.models import Cargo

        auditlog.register(Empleado)
        auditlog.register(Documento)
        auditlog.register(Contrato)
        auditlog.register(Empresa)
        auditlog.register(Cargo)