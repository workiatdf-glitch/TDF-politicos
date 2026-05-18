import os
import random
from datetime import date, timedelta
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Date, Numeric, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.orm import relationship

from pydantic import BaseModel
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
    menciones = relationship("MencionTexto", back_populates="politico")

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

class MencionTexto(Base):
    __tablename__ = "menciones_texto"
    id = Column(Integer, primary_key=True, index=True)
    politico_id = Column(String(100), ForeignKey("politicos.id"))
    fecha = Column(Date, nullable=False)
    texto = Column(String, nullable=False)
    sentimiento = Column(String(20))
    fuente = Column(String(100))
    url = Column(String(500))
    politico = relationship("Politico", back_populates="menciones")

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
        return []
    return metricas

@app.get("/politicos/{politico_id}/menciones")
def read_menciones(politico_id: str, limit: int = 20, db: Session = Depends(get_db)):
    menciones = db.query(MencionTexto).filter(MencionTexto.politico_id == politico_id).order_by(MencionTexto.fecha.desc()).limit(limit).all()
    return menciones

@app.get("/politicos/{politico_id}/menciones/random")
def read_menciones_random(politico_id: str, limit: int = 5, db: Session = Depends(get_db)):
    from sqlalchemy.sql.expression import func
    menciones = db.query(MencionTexto).filter(MencionTexto.politico_id == politico_id).order_by(func.random()).limit(limit).all()
    if not menciones:
        return []
    return menciones

@app.post("/simular")
async def run_extraccion_real(db: Session = Depends(get_db)):
    # Ya no borramos todo al inicio para no dejar el dashboard vacío 20 minutos
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
        print(f"--- Iniciando extracción para: {pol.nombre} ---")
        try:
            # Borrar solo lo de este político antes de re-poblar
            db.query(MetricaImagen).filter(MetricaImagen.politico_id == pol.id).delete()
            db.query(MencionTexto).filter(MencionTexto.politico_id == pol.id).delete()
            db.commit()

            timeline_generada, menciones_generadas = scraper.generar_timeline_hibrido(pol.nombre, fechas)
            
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

            for m in menciones_generadas:
                mencion = MencionTexto(
                    politico_id=pol.id,
                    fecha=date.today(),
                    texto=m["texto"],
                    sentimiento=m["sentimiento"],
                    fuente=m["red"]
                )
                db.add(mencion)
            
            # Commit por cada político para que la UI se actualice progresivamente
            db.commit()
            print(f"✓ {pol.nombre} completado.")
            
            import time
            time.sleep(1)
        except Exception as e:
            db.rollback()
            print(f"✕ Falla scraper con {pol.nombre}: {e}")
            pass

    return {"mensaje": "Simulación progresiva completada."}

@app.post("/politicos/{politico_id}/scrappear")
async def run_scrappear_uno(politico_id: str, db: Session = Depends(get_db)):
    pol = db.query(Politico).filter(Politico.id == politico_id).first()
    if not pol:
        raise HTTPException(status_code=404, detail="Político no encontrado")
    
    start_date = date(2019, 12, 1)
    end_date = date.today()
    fechas = []
    current_date = start_date
    while current_date <= end_date:
        fechas.append(current_date)
        next_month = current_date.month % 12 + 1
        year_add = 1 if current_date.month == 12 else 0
        current_date = date(current_date.year + year_add, next_month, 1)

    print(f"--- Extracción FORZADA para: {pol.nombre} ---")
    try:
        db.query(MetricaImagen).filter(MetricaImagen.politico_id == pol.id).delete()
        db.query(MencionTexto).filter(MencionTexto.politico_id == pol.id).delete()
        db.commit()

        timeline_generada, menciones_generadas = scraper.generar_timeline_hibrido(pol.nombre, fechas)
        
        for t in timeline_generada:
            db.add(MetricaImagen(
                politico_id=pol.id, fecha=t["fecha"],
                imagen_positiva=t["pos"], imagen_neutra=t["neu"],
                imagen_negativa=t["neg"], fuente=t["fuente"]
            ))

        for m in menciones_generadas:
            db.add(MencionTexto(
                politico_id=pol.id, fecha=date.today(),
                texto=m["texto"], sentimiento=m["sentimiento"], fuente=m["red"]
            ))
        
        db.commit()
        return {"status": "success", "mensaje": f"Perfil de {pol.nombre} actualizado."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

class PoliticoSwapRequest(BaseModel):
    old_id: str
    new_nombre: str
    new_cargo: str

@app.post("/politicos/swap")
async def swap_politico(req: PoliticoSwapRequest, db: Session = Depends(get_db)):
    old_pol = db.query(Politico).filter(Politico.id == req.old_id).first()
    if not old_pol:
        raise HTTPException(status_code=404, detail="Político a reemplazar no encontrado")
    
    import re
    import unicodedata
    new_id = req.new_nombre.lower().strip()
    new_id = ''.join(c for c in unicodedata.normalize('NFD', new_id) if unicodedata.category(c) != 'Mn')
    new_id = re.sub(r'[^a-z0-9]', '', new_id)
    
    if not new_id:
        raise HTTPException(status_code=400, detail="Nombre del nuevo político no válido")
        
    existing = db.query(Politico).filter(Politico.id == new_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un político con ese nombre")
        
    old_categoria = old_pol.categoria
    
    try:
        db.query(MetricaImagen).filter(MetricaImagen.politico_id == req.old_id).delete()
        db.query(MencionTexto).filter(MencionTexto.politico_id == req.old_id).delete()
        
        db.delete(old_pol)
        db.commit()
        
        new_pol = Politico(
            id=new_id,
            nombre=req.new_nombre,
            cargo=req.new_cargo,
            categoria=old_categoria
        )
        db.add(new_pol)
        db.commit()
        
        start_date = date(2019, 12, 1)
        end_date = date.today()
        fechas = []
        current_date = start_date
        while current_date <= end_date:
            fechas.append(current_date)
            next_month = current_date.month % 12 + 1
            year_add = 1 if current_date.month == 12 else 0
            current_date = date(current_date.year + year_add, next_month, 1)
            
        timeline_generada, menciones_generadas = scraper.generar_timeline_hibrido(new_pol.nombre, fechas)
        
        for t in timeline_generada:
            db.add(MetricaImagen(
                politico_id=new_pol.id, fecha=t["fecha"],
                imagen_positiva=t["pos"], imagen_neutra=t["neu"],
                imagen_negativa=t["neg"], fuente=t["fuente"]
            ))

        for m in menciones_generadas:
            db.add(MencionTexto(
                politico_id=new_pol.id, fecha=date.today(),
                texto=m["texto"], sentimiento=m["sentimiento"], fuente=m["red"]
            ))
            
        db.commit()
        return {"status": "success", "mensaje": f"Se reemplazó a {old_pol.nombre} por {new_pol.nombre}.", "new_id": new_id, "new_politico": {"id": new_id, "nombre": new_pol.nombre, "cargo": new_pol.cargo, "categoria": new_pol.categoria}}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/estado")
def read_estado():
    return {"status": "ok", "message": "API scraper y db listos"}

