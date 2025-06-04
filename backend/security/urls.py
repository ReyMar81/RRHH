from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from security.views import UserThemeView, UserDetailView

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('theme/', UserThemeView.as_view(), name='user_theme'),
    path('user/', UserDetailView.as_view(), name='user_detail'),
]