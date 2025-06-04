from rest_framework import viewsets, permissions
from auditlog.models import LogEntry
from apps.bitacora.serializers import LogEntrySerializer

class IsEmpresaUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, "empresa") and request.user.empresa is not None

class LogEntryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LogEntrySerializer
    permission_classes = [IsEmpresaUser]

    def get_queryset(self):
        empresa = self.request.user.empresa
        # Tomar solo los logs de objetos que tengan empresa=la de este usuario
        # Esto es un poco "costoso", pero sirve y se puede optimizar si quieres
        logs = LogEntry.objects.all().select_related('actor', 'content_type')
        filtered_ids = []
        for log in logs:
            try:
                model = log.content_type.model_class()
                obj = model.objects.filter(pk=log.object_pk, empresa=empresa).first()
                if obj:
                    filtered_ids.append(log.pk)
            except Exception:
                continue
        return logs.filter(pk__in=filtered_ids)
