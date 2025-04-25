#!/bin/bash

# Solo crear el proyecto si no existe manage.py
if [ ! -f "/app/backend/manage.py" ]; then
  echo "🛠️ Creando proyecto Django..."
  django-admin startproject rrhh /app/backend
  echo "✅ Proyecto creado."
fi

cd /app/backend

# Ejecutar migraciones de Django antes de iniciar el servidor
echo "🔄 Ejecutando makemigrations y migrate..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

# Crear superusuario automáticamente si no existe
if ! python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print(User.objects.filter(username='${DJANGO_SUPERUSER_USERNAME}').exists())" | grep -q True; then
  echo "🛠️ Creando superusuario..."
  python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.create_superuser(
    "${DJANGO_SUPERUSER_USERNAME}",
    "${DJANGO_SUPERUSER_EMAIL}",
    "${DJANGO_SUPERUSER_PASSWORD}"
)
END
else
  echo "✅ Superusuario ya existe."
fi

# Iniciar el servidor de Django
echo "🚀 Iniciando Django..."
python manage.py runserver 0.0.0.0:8000
