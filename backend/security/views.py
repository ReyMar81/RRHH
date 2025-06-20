from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from security.serializers import CustomTokenObtainPairSerializer
from security.models import UserTheme
from apps.bitacora.utils import registrar_bitacora

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        # Obtener usuario autenticado del serializer
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.user
            if user and user.is_authenticated:
                registrar_bitacora(
                    empresa=user.empresa,
                    usuario=user,
                    accion="Inicio de sesión",
                    ip=request.META.get('REMOTE_ADDR'),
                    detalles={"user_agent": request.META.get('HTTP_USER_AGENT')}
                )
        except Exception:
            pass  # Si falla la autenticación, no registrar
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