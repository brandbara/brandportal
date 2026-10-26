#!/usr/bin/env bash
# Restaura una copia creada con hacer_copia.sh en una base de datos de destino.
#
# Uso:  TARGET_URL='postgresql://...' BACKUP_PASSPHRASE='...' ./restaurar_copia.sh copia-bd-XXXX.sql.gz.enc
#
# - La base de destino debe tener ya la ESTRUCTURA (supabase/schema/esquema_referencia.sql) y estar
#   VACÍA de datos. Si hay filas repetidas, la restauración se cancela entera y no se cambia nada.
# - Todo se aplica en una única transacción: o se restaura todo o no se toca nada.
set -euo pipefail

: "${TARGET_URL:?Falta TARGET_URL (base de datos de destino)}"
: "${BACKUP_PASSPHRASE:?Falta BACKUP_PASSPHRASE (contraseña con la que se cifró la copia)}"
ARCHIVO="${1:?Indica el archivo de la copia (.sql.gz.enc)}"

openssl enc -aes-256-cbc -pbkdf2 -iter 600000 -pass env:BACKUP_PASSPHRASE -d -in "$ARCHIVO" \
  | gunzip \
  | psql "$TARGET_URL" -q -v ON_ERROR_STOP=1 --single-transaction

echo "Restauración completada."
