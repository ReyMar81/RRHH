from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import UserTheme


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Agregar información adicional al token
        grupo = user.groups.first()
        if user.is_superuser:
            token['rol'] = 'superadmin'
        elif grupo:
            token['rol'] = grupo.name
        else:
            token['rol'] = None

        token['cambio_password_pendiente'] = user.cambio_password_pendiente

        return token


class UserThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTheme
        fields = ['color_text', 'color1', 'color2', 'font_size', 'font_family']