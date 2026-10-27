"""
Script de sincronización directa con Supabase PostgreSQL (o cualquier DATABASE_URL).
Puede ejecutarse desde GitHub Actions (sin servidor propio) o manualmente:
  DATABASE_URL="postgresql://postgres.[ref]:[pwd]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" python sync_supabase.py
"""
from main import SessionLocal, Politico, MetricaImagen, MencionTexto, DebatePublicacion, ComentarioDebate, asegurar_esquema_y_datos, guardar_datos_politico

def sincronizar_todos():
    print("1. Verificando esquema y catálogo inicial en PostgreSQL / Supabase...")
    asegurar_esquema_y_datos()

    db = SessionLocal()
    try:
        politicos = db.query(Politico).all()
        print(f"2. Actualizando inteligencia RSS (TDF y Nacional) para {len(politicos)} figuras...")
        for pol in politicos:
            try:
                db.query(MetricaImagen).filter(MetricaImagen.politico_id == pol.id).delete()
                db.query(MencionTexto).filter(MencionTexto.politico_id == pol.id).delete()
                debates_ids = [d.id for d in db.query(DebatePublicacion).filter(DebatePublicacion.politico_id == pol.id).all()]
                if debates_ids:
                    db.query(ComentarioDebate).filter(ComentarioDebate.debate_id.in_(debates_ids)).delete(synchronize_session=False)
                db.query(DebatePublicacion).filter(DebatePublicacion.politico_id == pol.id).delete(synchronize_session=False)
                db.commit()

                # Extrae feeds RSS reales (TDF o Nacional) y genera debates/menciones
                guardar_datos_politico(db, pol, usar_cv=False)
                db.commit()
                print(f"  ✓ [{pol.ambito.upper()}] {pol.nombre} actualizado.")
            except Exception as e:
                db.rollback()
                print(f"  ✕ Error actualizando {pol.nombre}: {e}")
        print("✅ Sincronización completada con éxito.")
    finally:
        db.close()

if __name__ == "__main__":
    sincronizar_todos()
