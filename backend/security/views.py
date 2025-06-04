from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from security.serializers import CustomTokenObtainPairSerializer
from security.models import UserTheme

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # Verifica que el refresh_token se incluya en la respuesta
        return response


class UserThemeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        theme, created = UserTheme.objects.get_or_create(usuario=request.user)
        return Response(
            {
                "colorText": theme.color_text,
                "color1": theme.color1,
                "color2": theme.color2,
                "fontSize": theme.font_size,
                "fontFamily": theme.font_family,
            }
        )

    def put(self, request):
        theme, created = UserTheme.objects.get_or_create(usuario=request.user)
        for key, value in request.data.items():
            setattr(theme, key, value)
        theme.save()
        return Response(
            {
                "colorText": theme.color_text,
                "color1": theme.color1,
                "color2": theme.color2,
                "fontSize": theme.font_size,
                "fontFamily": theme.font_family,
            }
        )


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "username": user.username,
                "email": user.email,
                "groups": [group.name for group in user.groups.all()],
            }
        )