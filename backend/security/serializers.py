from rest_framework_simplejwt.serializers import AuthUser, TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Agregar campo de grupo o rol
        grupo = user.groups.first()
        if user.is_superuser:
            token['rol'] = 'superadmin'
        elif grupo:
            token['rol'] = grupo.name
        else:
            token['rol'] = None

        token['cambio_password_pendiente'] = user.cambio_password_pendiente

        return token