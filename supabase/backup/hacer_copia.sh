#!/usr/bin/env bash
# Copia de seguridad CIFRADA de los datos de BrandBara (cuentas, perfiles y portales).
#
# Uso:  DB_URL='postgresql://...' BACKUP_PASSPHRASE='...' ./hacer_copia.sh [carpeta_de_salida]
#
# - Solo vuelca DATOS: la estructura está en supabase/schema/esquema_referencia.sql.
# - El resultado se cifra con AES-256 (contraseña = BACKUP_PASSPHRASE) ANTES de salir de este script:
#   nunca se escribe un volcado en claro en disco.
# - No copia los archivos (imágenes/vídeos) del almacenamiento, solo la base de datos.
set -euo pipefail

: "${DB_URL:?Falta DB_URL (cadena de conexión de la base de datos)}"
: "${BACKUP_PASSPHRASE:?Falta BACKUP_PASSPHRASE (contraseña de cifrado)}"

OUT_DIR="${1:-.}"
mkdir -p "$OUT_DIR"
FECHA="$(date -u +%Y-%m-%d_%H%M)"
ARCHIVO="$OUT_DIR/copia-bd-$FECHA.sql.gz.enc"
RESUMEN="$OUT_DIR/resumen-$FECHA.txt"
CIFRADO=(openssl enc -aes-256-cbc -pbkdf2 -iter 600000 -pass env:BACKUP_PASSPHRASE)

echo "Volcando datos…"
pg_dump "$DB_URL" --data-only --no-owner --no-privileges \
  -t public.profiles -t public.portals -t auth.users -t auth.identities \
  | gzip -9 \
  | "${CIFRADO[@]}" -salt -out "$ARCHIVO"

# Comprobación: se puede descifrar y contiene los datos esperados
for tabla in public.profiles public.portals auth.users; do
  n=$("${CIFRADO[@]}" -d -in "$ARCHIVO" | gunzip | grep -c "^COPY $tabla " || true)
  if [ "$n" -lt 1 ]; then
    echo "ERROR: la copia no contiene la tabla $tabla; no se da por válida." >&2
    rm -f "$ARCHIVO"
    exit 1
  fi
done

# Resumen en claro: SOLO fecha, tamaños y número de filas (nada de contenido ni de datos personales)
CUENTAS="$(psql "$DB_URL" -Atq -c "select (select count(*) from auth.users) || ' usuarios, ' || (select count(*) from public.profiles) || ' perfiles, ' || (select count(*) from public.portals) || ' portales'")"
{
  echo "fecha_utc: $FECHA"
  echo "filas: $CUENTAS"
  echo "tamano_copia_bytes: $(wc -c < "$ARCHIVO" | tr -d ' ')"
  echo "sha256: $(sha256sum "$ARCHIVO" | cut -d' ' -f1)"
} > "$RESUMEN"

echo "Copia creada y verificada: $ARCHIVO"
cat "$RESUMEN"
