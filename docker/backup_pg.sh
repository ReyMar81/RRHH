#!/bin/bash

# Fecha actual
FECHA=$(date +%Y-%m-%d_%H-%M-%S)
DESTINO="/mnt/d/Universidad/SI2/ProyectoFinal/RRHH/backups"
ARCHIVO="backup_rrhh_$FECHA.sql.gz"
ARCHIVO_COMPLETO="$DESTINO/$ARCHIVO"

# Crear carpeta si no existe
mkdir -p "$DESTINO"

# Backup con compresión
docker exec -e PGPASSWORD=rrhh_pass db pg_dump -U rrhh_user rrhh_db | gzip > "$ARCHIVO_COMPLETO"

# Subir a Google Drive
rclone copy "$ARCHIVO_COMPLETO" mi_drive:RRHHBackups

# Borrar backups locales de más de 7 días
find "$DESTINO" -name "*.sql.gz" -type f -mtime +7 -delete
