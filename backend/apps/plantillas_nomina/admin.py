# Register your models here if you use Django admin.
from django.contrib import admin
from .models import Pais, EstructuraSalarialPlantilla, ReglaSalarialPlantilla

admin.site.register(Pais)
admin.site.register(EstructuraSalarialPlantilla)
admin.site.register(ReglaSalarialPlantilla)
