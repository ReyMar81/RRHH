from rest_framework_simplejwt.serializers import AuthUser, TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user: AuthUser):
        token = super().get_token(user)

        token['id_user'] =user.id

        # Agregar el primer grupo si existe
        grupo = user.groups.first()
        token['rol'] = grupo.name if grupo else None

        #token['roles'] = [group.name for group in user.groups.all()]  # Lista de roles

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data['id_user'] = self.user.id

        grupo = self.user.groups.first()
        data['rol'] = grupo.name if grupo else None

        #data['roles'] = [group.name for group in self.user.groups.all()]   # Lista de roles

        return data