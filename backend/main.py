import os
import random
from datetime import date, timedelta
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Date, Numeric, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.orm import relationship

import scraper

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:password@localhost:5432/politicostdf")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Politico(Base):
    __tablename__ = "politicos"
    id = Column(String(100), primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    cargo = Column(String(100), nullable=False)
    categoria = Column(String(50), nullable=False)
    metricas = relationship("MetricaImagen", back_populates="politico")

class MetricaImagen(Base):
    __tablename__ = "metricas_imagen"
    id = Column(Integer, primary_key=True, index=True)
    politico_id = Column(String(100), ForeignKey("politicos.id"))
    fecha = Column(Date, nullable=False)
    imagen_positiva = Column(Numeric(5, 2), nullable=False)
    imagen_neutra = Column(Numeric(5, 2), nullable=False)
    imagen_negativa = Column(Numeric(5, 2), nullable=False)
    fuente = Column(String(100), default="Extracción de Medios")
    politico = relationship("Politico", back_populates="metricas")

app = FastAPI(title="TDF Politicos API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/politicos")
def read_politicos(categoria: str = None, db: Session = Depends(get_db)):
    query = db.query(Politico)
    if categoria:
        query = query.filter(Politico.categoria == categoria)
    return query.all()

@app.get("/politicos/{politico_id}/metricas")
def read_metricas(politico_id: str, db: Session = Depends(get_db)):
    metricas = db.query(MetricaImagen).filter(MetricaImagen.politico_id == politico_id).order_by(MetricaImagen.fecha.asc()).all()
    if not metricas:
        raise HTTPException(status_code=404, detail="Métricas no encontradas para este político")
    return metricas

@app.post("/simular")
async def run_extraccion_real(db: Session = Depends(get_db)):
    db.query(MetricaImagen).delete()
    db.commit()

    politicos = db.query(Politico).all()
    if not politicos:
        return {"mensaje": "No hay políticos cargados en la base."}

    start_date = date(2019, 12, 1)
    end_date = date.today()
    
    current_date = start_date
    fechas = []
    while current_date <= end_date:
        fechas.append(current_date)
        next_month = current_date.month % 12 + 1
        year_add = 1 if current_date.month == 12 else 0
        current_date = date(current_date.year + year_add, next_month, 1)

    for pol in politicos:
        print(f"Extrayendo datos de: {pol.nombre}...")
        try:
            timeline_generada = scraper.generar_timeline_hibrido(pol.nombre, fechas)
            
            for t in timeline_generada:
                metrica = MetricaImagen(
                    politico_id=pol.id,
                    fecha=t["fecha"],
                    imagen_positiva=t["pos"],
                    imagen_neutra=t["neu"],
                    imagen_negativa=t["neg"],
                    fuente=t["fuente"]
                )
                db.add(metrica)
            
            # Espaciador suave para no saturar DuckDuckGo
            import time
            time.sleep(1)
        except Exception as e:
            print(f"Falla scraper con {pol.nombre}: {e}")
            pass

    db.commit()
    return {"mensaje": "Recolección híbrida de noticias completada con éxito."}

@app.get("/estado")
def read_estado():
    return {"status": "ok", "message": "API scraper y db listos"}
