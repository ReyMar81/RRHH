from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Notificacion
from .serializer import NotificacionSerializer
# Create your views here.


class NotificacionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificacionSerializer

    def get_queryset(self):
    empleado = self.request.user.empleado  # asumiendo relación OneToOne
    return Notificacion.objects.filter(empleado=empleado, empresa=empleado.empresa).order_by('fecha_creacion')
