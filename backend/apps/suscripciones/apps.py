from django.apps import AppConfig


class SuscripcionesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.suscripciones'

    def ready(self):
        from .setup import crear_planes_y_privilegios
        try:
            crear_planes_y_privilegios()
        except Exception as e:
            print(f"[WARN] No se pudieron crear los planes y privilegios automáticamente: {e}")
