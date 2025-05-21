from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.cargo_departamento.models import CargoDepartamento
from apps.cargo_departamento.serializers import CargoDepartamentoSerializer


# Create your views here.

class CargoDepartamentoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = CargoDepartamento.objects.all()
    serializer_class = CargoDepartamentoSerializer