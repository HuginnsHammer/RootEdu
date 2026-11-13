#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEY_DIR="$ROOT/secrets"
CERT_DIR="$ROOT/mobile/certs"
KEY_FILE="$KEY_DIR/rootedu-ota-private-key.pem"
CERT_FILE="$CERT_DIR/rootedu-ota-certificate.pem"

if [[ -e "$KEY_FILE" || -e "$CERT_FILE" ]]; then
  echo "Refusing to overwrite an existing OTA signing key or certificate." >&2
  exit 1
fi

command -v openssl >/dev/null || { echo "OpenSSL is required." >&2; exit 1; }
mkdir -p "$KEY_DIR" "$CERT_DIR"
chmod 700 "$KEY_DIR"

openssl req -x509 -newkey rsa:3072 -sha256 -nodes \
  -keyout "$KEY_FILE" \
  -out "$CERT_FILE" \
  -days 365 \
  -subj "/CN=RootEdu OTA Release Signing/"

chmod 600 "$KEY_FILE"
chmod 644 "$CERT_FILE"

echo
echo "OTA signing material generated."
echo "PRIVATE KEY (never commit): $KEY_FILE"
echo "PUBLIC CERTIFICATE (commit this): $CERT_FILE"
echo
echo "Back up the private key in an encrypted password manager or secrets vault."
echo "Add the private key contents as GitHub Actions secret ROOTEDU_OTA_PRIVATE_KEY."
echo "The public certificate must be included in every APK that receives these signed updates."
