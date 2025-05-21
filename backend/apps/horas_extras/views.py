from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.horas_extras.models import HorasExtras
from apps.horas_extras.serializers import HorasExtrasSerializer


# Create your views here.

class HorasExtrasViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = HorasExtras.objects.all()
    serializer_class = HorasExtrasSerializer
