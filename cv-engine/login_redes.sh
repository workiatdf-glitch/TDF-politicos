#!/bin/bash
echo "=== Inicio de Sesión de Playwright ==="
echo "Este script abrirá un navegador de Chromium para que inicies sesión en las redes sociales."
echo "La sesión se guardará y será utilizada por el contenedor de Docker para extraer datos."
echo ""
echo "Por favor, inicia sesión en:"
echo "1. x.com"
echo "2. facebook.com"
echo "3. instagram.com"
echo ""
echo "Cierra las pestañas pero NO CIERRES EL NAVEGADOR hasta que hayas iniciado sesión en las 3 plataformas."
echo "Cuando hayas terminado con las 3, simplemente CIERRA el navegador por completo."

cd "$(dirname "$0")"

# Usamos npx para invocar playwright. Asumimos que Node está instalado.
# Se instalará temporalmente si no existe en la carpeta actual.
npm install -g playwright@1.40.1 > /dev/null 2>&1 || true
npx -y playwright install chromium > /dev/null 2>&1
npx -y playwright open --user-data-dir=./playwright_context "https://x.com/login"

echo ""
echo "¡Sesión guardada! Ahora puedes reiniciar el contenedor de cv-engine."
