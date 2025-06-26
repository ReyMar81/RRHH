from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Notificacion
from .serializer import NotificacionSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
# Create your views here.


class NotificacionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificacionSerializer

    def get_queryset(self):
        empleado = self.request.user.empleado  # asumiendo relación OneToOne
        return Notificacion.objects.filter(empleado=empleado).order_by('fecha_creacion')

    @action(detail=False, methods=['patch'], url_path='mensaje-leido')
    def leer_notificacion(self, request):
        notificacion = self.get_object()
        leido = request.data.get('leido')
        if leido not in [True]:
            return Response({'error': 'Debe incluir el campo "booleano"'}, status=400)
        notificacion.leido = autoriza
        notificacion.save()
        return Response({'mensaje': 'Notificacion leida correctamente'}, status=200)