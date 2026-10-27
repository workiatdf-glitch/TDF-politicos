# Guía de Integración 24/7 sin Servidor Propio (GitHub + Supabase + Cloudflare)

Esta arquitectura te permite mantener tus contenedores **Docker** para trabajar localmente en tu Mac y, al mismo tiempo, compartir el sistema **24/7 gratis** con tus compañeros usando **Supabase (PostgreSQL)**, **GitHub Actions** y **Cloudflare**.

---

## Paso 1: Conectar la Base de Datos en Supabase (PostgreSQL)

1. Ingresa a [Supabase](https://supabase.com/) con tu cuenta de GitHub y crea un proyecto nuevo (por ejemplo: `tdf-politicos`).
2. Ve a **Project Settings -> Database -> Connection string -> URI** (elige el modo *Session pooler* en puerto `5432` o *Transaction* en `6543`).
3. Copia la URL de conexión. Tendrá este formato:
   ```text
   postgresql://postgres.[tu-id]:[tu-password]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
   ```
4. *(Opcional)* Si quieres que tu Docker local use directamente la base en la nube de Supabase en lugar de la base local, solo debes reemplazar `DATABASE_URL` en `docker-compose.yml` bajo el servicio `api`. Al arrancar, `backend/main.py` creará automáticamente todas las tablas (`politicos`, `metricas_imagen`, `debates_publicacion`, `comentarios_debate`, `usuarios`, `solicitudes_cambio`, `mensajes_chat`) y cargará tanto el **Ámbito Tierra del Fuego** como el **Ámbito Nacional**.

---

## Paso 2: Actualización Frecuente Automática desde GitHub

Ya dejamos configurado el flujo automático en `.github/workflows/actualizar_supabase.yml`.
1. En tu repositorio de GitHub (`https://github.com/workiatdf-glitch/TDF-politicos`), ve a **Settings -> Secrets and variables -> Actions**.
2. Crea un **New repository secret** llamado:
   - Nombre: `SUPABASE_DATABASE_URL`
   - Valor: *(pega la URI de PostgreSQL de tu Supabase)*
3. A partir de ese momento, **GitHub Actions** actualizará las métricas y foros de los candidatos de TDF y Nacionales automáticamente cada 12 horas (o cuando presiones *"Run workflow"* en la pestaña *Actions* de GitHub) sin que tu computadora tenga que estar encendida.

---

## Paso 3: Publicar la Interfaz en Cloudflare Pages 24/7

1. Entra a tu cuenta de [Cloudflare Dashboard](https://dash.cloudflare.com/) y ve a **Workers & Pages -> Create -> Pages -> Connect to Git**.
2. Selecciona tu repositorio `workiatdf-glitch/TDF-politicos`.
3. Configura el despliegue con estos parámetros:
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variable**: `VITE_API_URL` apuntando a tu túnel de Cloudflare (`cloudflared`) o instancia gratuita de API (por ejemplo en Render.com conectada al mismo GitHub y `SUPABASE_DATABASE_URL`).
