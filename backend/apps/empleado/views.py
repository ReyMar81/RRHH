from rest_framework import viewsets
from .models import Empleado
from .serializer import EmpleadoSerializers

from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class EmpleadoViewSets(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializers
    
    def perform_create(self, serializer):
        ci = serializer.validated_data['ci']
        apellidos = serializer.validated_data['apellido']
        username = f'{ci}.{self.iniciales(apellidos)}'
        email = f'{username}@rrhh.com'
        password = User.objects.make_random_password()
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=serializer.validated_data['nombre'],
            last_name=apellidos,
        )
        
        empleado = serializer.save(user_id=user)
        
        send_mail(
            subject='Tu cuenta ha sido creada',
            message=f"""Hola {empleado.nombre},\n\n
            Tu cuenta ha sido creada. \n
            Username: {username}\n
            Password: {password}""",
            from_email='no-reply@miempresa.com',
            recipient_list=[empleado.email_personal],  
            fail_silently=False,
        )
        
    def iniciales(self, apellidos:str):
        lista_apellidos = apellidos.split()
        iniciales = ''
        for apellido in lista_apellidos:
            iniciales += apellido[0].upper()
        return iniciales