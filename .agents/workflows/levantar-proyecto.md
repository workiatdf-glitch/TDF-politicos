---
description: Cómo levantar el proyecto TDF Políticos 2.0 después de reiniciar la computadora
---

# Levantar TDF Políticos 2.0

## Requisitos previos
- Docker Desktop debe estar corriendo (abrirlo si no se abre automáticamente al iniciar)

## Pasos

// turbo-all

1. Verificar que Docker esté corriendo:
```bash
docker info > /dev/null 2>&1 && echo "Docker OK" || echo "Docker NO está corriendo, abrir Docker Desktop"
```

2. Levantar todos los servicios:
```bash
cd /Users/drpadrino/Documents/WorIaTdf/TdfPoliticos && docker-compose up -d
```

3. Verificar que los 4 contenedores estén activos:
```bash
docker ps --filter "name=tdf_politicos" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

4. Esperar a que los servicios estén listos (especialmente cv_engine que carga Detectron2):
```bash
sleep 10 && curl -s http://localhost:8000/estado && echo "" && curl -s http://localhost:6969 > /dev/null && echo "Frontend OK en http://localhost:6969"
```

## Puertos
| Servicio   | Puerto | URL                        |
|------------|--------|----------------------------|
| Frontend   |  6969  | http://localhost:6969       |
| API        |  8000  | http://localhost:8000       |
| CV Engine  |  8001  | http://localhost:8001       |
| PostgreSQL |  5432  | localhost:5432              |

## Notas
- Los datos de la base de datos persisten en el volumen Docker `db_data`
- Si necesitás regenerar datos, usá el botón "Actualizar Inteligencia" en el dashboard
- Si hay problemas, revisá logs con: `docker-compose logs -f`
- Para detener todo: `docker-compose down` (los datos se mantienen)
- Para detener y borrar datos: `docker-compose down -v` (¡CUIDADO! Borra la BD)
