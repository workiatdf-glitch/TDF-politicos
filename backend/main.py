import os
import re
import unicodedata
import random
from datetime import date, datetime, timedelta
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Date, Numeric, ForeignKey, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship, joinedload
from pydantic import BaseModel
import scraper

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:password@localhost:5432/politicostdf")
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Politico(Base):
    __tablename__ = "politicos"
    id = Column(String(100), primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    cargo = Column(String(100), nullable=False)
    categoria = Column(String(50), nullable=False)
    ambito = Column(String(50), nullable=False, default="tdf")
    metricas = relationship("MetricaImagen", back_populates="politico", cascade="all, delete-orphan")
    menciones = relationship("MencionTexto", back_populates="politico", cascade="all, delete-orphan")
    debates = relationship("DebatePublicacion", back_populates="politico", cascade="all, delete-orphan")

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

class DebatePublicacion(Base):
    __tablename__ = "debates_publicacion"
    id = Column(Integer, primary_key=True, index=True)
    politico_id = Column(String(100), ForeignKey("politicos.id"))
    titulo = Column(String(300), nullable=False)
    contenido = Column(String, nullable=True)
    fecha = Column(Date, nullable=False)
    fuente = Column(String(100), nullable=False)
    url = Column(String(500), nullable=True)
    politico = relationship("Politico", back_populates="debates")
    comentarios = relationship("ComentarioDebate", back_populates="debate", cascade="all, delete-orphan")

class ComentarioDebate(Base):
    __tablename__ = "comentarios_debate"
    id = Column(Integer, primary_key=True, index=True)
    debate_id = Column(Integer, ForeignKey("debates_publicacion.id"))
    usuario = Column(String(100), nullable=False)
    texto = Column(String, nullable=False)
    sentimiento = Column(String(20), nullable=False)
    fecha = Column(Date, nullable=False)
    debate = relationship("DebatePublicacion", back_populates="comentarios")

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    nombre_mostrar = Column(String(100), nullable=False)
    password = Column(String(100), nullable=False)
    rol = Column(String(20), nullable=False, default="visualizador") # 'admin' o 'visualizador'

class SolicitudCambio(Base):
    __tablename__ = "solicitudes_cambio"
    id = Column(Integer, primary_key=True, index=True)
    autor_nombre = Column(String(100), nullable=False)
    autor_rol = Column(String(30), nullable=False)
    ambito = Column(String(50), nullable=False, default="tdf")
    old_politico_id = Column(String(100), nullable=False)
    old_politico_nombre = Column(String(200), nullable=False)
    new_politico_nombre = Column(String(200), nullable=False)
    new_politico_cargo = Column(String(150), nullable=False)
    motivo = Column(String, nullable=False)
    estado = Column(String(30), nullable=False, default="pendiente") # 'pendiente', 'aprobada', 'rechazada'
    nota_admin = Column(String, nullable=True)
    fecha_creacion = Column(String(50), nullable=False)

class MensajeChat(Base):
    __tablename__ = "mensajes_chat"
    id = Column(Integer, primary_key=True, index=True)
    autor_nombre = Column(String(100), nullable=False)
    autor_rol = Column(String(30), nullable=False)
    ambito = Column(String(50), nullable=False, default="general")
    texto = Column(String, nullable=False)
    fecha_hora = Column(String(50), nullable=False)


POLITICOS_INICIALES = [
    # TDF
    ("melella", "Gustavo Melella", "Gobernador TDF", "Primera línea", "tdf"),
    ("vuoto", "Walter Vuoto", "Intendente Ushuaia", "Primera línea", "tdf"),
    ("perez", "Martín Perez", "Intendente Río Grande", "Primera línea", "tdf"),
    ("harrington", "Daniel Harrington", "Intendente Tolhuin", "Primera línea", "tdf"),
    ("urquiza", "Mónica Urquiza", "Vicegobernadora", "Primera línea", "tdf"),
    ("greve", "Federico Greve", "Legislador Provincial", "Primera línea", "tdf"),
    ("lechman", "Federico Lechman", "Legislador Provincial", "Primera línea", "tdf"),
    ("pino", "Juan Carlos Pino", "Vicegobernador Int. / Legislador", "Primera línea", "tdf"),
    ("tita", "Agustín Tita", "Jefe de Gabinete TDF", "Primera línea", "tdf"),
    ("vonderthusen", "Raúl von der Thusen", "Legislador / Ex Concejal", "Primera línea", "tdf"),
    ("sciurano", "Federico Sciurano", "Legislador Provincial", "Segunda línea", "tdf"),
    ("lores", "Damián Löffler", "Legislador Provincial", "Segunda línea", "tdf"),
    ("martinez_m", "Myriam Martínez", "Legisladora Provincial", "Segunda línea", "tdf"),
    ("colazo", "Laura Colazo", "Legisladora Provincial", "Segunda línea", "tdf"),
    ("vvuoto", "Victoria Vuoto", "Legisladora Provincial", "Segunda línea", "tdf"),
    ("runin", "Federico Runin", "Ministro de Gobierno", "Segunda línea", "tdf"),
    ("castillo", "Gabriela Castillo", "Ministra de Obras Públicas", "Segunda línea", "tdf"),
    ("digiglio", "Judit Di Giglio", "Ministra de Salud", "Segunda línea", "tdf"),
    ("rossi", "Lucía Rossi", "Secretaria/Dirigente", "Segunda línea", "tdf"),
    ("coto", "Agustín Coto", "Legislador Provincial", "Segunda línea", "tdf"),
    ("graciania", "Natalia Graciania", "Legisladora Provincial", "Segunda línea", "tdf"),
    ("catena", "Horacio Catena", "Sec. Gral SUTEF", "Tercera línea", "tdf"),
    ("vergara", "René Vergara", "Sec. Gral Petroleros Privados", "Tercera línea", "tdf"),
    ("fernandez", "Claudia Fernández", "Cámara de Comercio Ushuaia", "Tercera línea", "tdf"),
    ("guglielmi", "Luciana Guglielmi", "Asociación Rural TDF", "Tercera línea", "tdf"),
    ("gliubich", "Fernando Gliubich", "Empresario Sector Agropecuario", "Tercera línea", "tdf"),
    ("worman", "Guillermo Worman", "Dir. Participación Ciudadana ONG", "Tercera línea", "tdf"),
    ("cordoba", "Marcelo Córdoba", "Dirigente ATE / Sec. General", "Tercera línea", "tdf"),
    ("etchepare", "Claudia Etchepare", "Sec. General ATSA", "Tercera línea", "tdf"),
    ("martinez_o", "Oscar Martínez", "Diputado M.C / Referente UOM", "Tercera línea", "tdf"),
    ("barrios", "Dr. Javier Andrés Barrios", "Sec. Gestión Sist. Sanitarios (Min. Salud)", "Tercera línea", "tdf"),
    # NACIONAL
    ("milei", "Javier Milei", "Presidente de la Nación (LLA)", "Primera línea", "nacional"),
    ("cfk", "Cristina Fernández de Kirchner", "Ex Presidenta / Referente PJ-UxP", "Primera línea", "nacional"),
    ("kicillof", "Axel Kicillof", "Gobernador PBA / Referente Federal PJ", "Primera línea", "nacional"),
    ("macri", "Mauricio Macri", "Ex Presidente / Pte. PRO Nacional", "Primera línea", "nacional"),
    ("villarruel", "Victoria Villarruel", "Vicepresidenta / Pdta. del Senado", "Primera línea", "nacional"),
    ("bullrich", "Patricia Bullrich", "Ministra de Seguridad Nacional", "Primera línea", "nacional"),
    ("caputo", "Luis Caputo", "Ministro de Economía de la Nación", "Primera línea", "nacional"),
    ("massa", "Sergio Massa", "Referente Frente Renovador / UxP", "Primera línea", "nacional"),
    ("francos", "Guillermo Francos", "Jefe de Gabinete de la Nación", "Segunda línea", "nacional"),
    ("pichetto", "Miguel Ángel Pichetto", "Diputado Nacional (Encuentro Federal)", "Segunda línea", "nacional"),
    ("lousteau", "Martín Lousteau", "Senador Nacional / Pte. UCR", "Segunda línea", "nacional"),
    ("llaryora", "Martín Llaryora", "Gobernador de Córdoba / Liga Federal", "Segunda línea", "nacional"),
    ("pullaro", "Maximiliano Pullaro", "Gobernador de Santa Fe / UCR", "Segunda línea", "nacional"),
    ("torres", "Ignacio Torres", "Gobernador de Chubut / Bloque Patagónico", "Segunda línea", "nacional"),
    ("menem_m", "Martín Menem", "Presidente Cámara de Diputados", "Tercera línea", "nacional"),
    ("bregman", "Myriam Bregman", "Referente Frente de Izquierda (FIT-U)", "Tercera línea", "nacional"),
]

def obtener_rango_fechas():
    start_date = date(2022, 1, 1)
    end_date = date.today()
    fechas = []
    current_date = start_date
    while current_date <= end_date:
        fechas.append(current_date)
        next_month = current_date.month % 12 + 1
        year_add = 1 if current_date.month == 12 else 0
        current_date = date(current_date.year + year_add, next_month, 1)
    return fechas

def guardar_datos_politico(db: Session, pol: Politico, usar_cv: bool = True):
    fechas = obtener_rango_fechas()
    timeline_generada, menciones_generadas, debates_generados = scraper.generar_timeline_hibrido(
        pol.nombre, fechas, ambito=pol.ambito or "tdf", usar_cv=usar_cv
    )
    
    for t in timeline_generada:
        db.add(MetricaImagen(
            politico_id=pol.id,
            fecha=t["fecha"],
            imagen_positiva=t["pos"],
            imagen_neutra=t["neu"],
            imagen_negativa=t["neg"],
            fuente=t["fuente"]
        ))

    for m in menciones_generadas:
        db.add(MencionTexto(
            politico_id=pol.id,
            fecha=date.today(),
            texto=m["texto"],
            sentimiento=m["sentimiento"],
            fuente=m["red"]
        ))

    for d_gen in debates_generados:
        debate = DebatePublicacion(
            politico_id=pol.id,
            titulo=d_gen["titulo"],
            contenido=d_gen["contenido"],
            fecha=d_gen["fecha"],
            fuente=d_gen["fuente"],
            url=d_gen["url"]
        )
        db.add(debate)
        db.flush()
        
        for c_gen in d_gen["comentarios"]:
            db.add(ComentarioDebate(
                debate_id=debate.id,
                usuario=c_gen["usuario"],
                texto=c_gen["texto"],
                sentimiento=c_gen["sentimiento"],
                fecha=c_gen["fecha"]
            ))

def asegurar_esquema_y_datos():
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE politicos ADD COLUMN IF NOT EXISTS ambito VARCHAR(50) NOT NULL DEFAULT 'tdf'"))
    
    db = SessionLocal()
    try:
        # 1. Asegurar Políticos (TDF y Nacionales)
        for pid, nombre, cargo, categoria, ambito in POLITICOS_INICIALES:
            existente = db.query(Politico).filter(Politico.id == pid).first()
            if not existente:
                nuevo_pol = Politico(id=pid, nombre=nombre, cargo=cargo, categoria=categoria, ambito=ambito)
                db.add(nuevo_pol)
            else:
                if not existente.ambito:
                    existente.ambito = ambito
        db.commit()

        # 2. Asegurar Usuarios por defecto
        usuarios_default = [
            ("admin", "Administrador General", "admin2026", "admin"),
            ("equipo", "Analista Equipo TDF", "tdf2026", "visualizador"),
            ("invitado", "Compañero Visualizador", "ver2026", "visualizador"),
        ]
        for uname, nmostrar, pwd, rol in usuarios_default:
            if not db.query(Usuario).filter(Usuario.username == uname).first():
                db.add(Usuario(username=uname, nombre_mostrar=nmostrar, password=pwd, rol=rol))
        db.commit()

        # 3. Asegurar mensajes iniciales en el Chat Interno
        if db.query(MensajeChat).count() == 0:
            ahora_str = datetime.now().strftime("%d/%m/%Y %H:%M")
            db.add(MensajeChat(
                autor_nombre="Administrador General",
                autor_rol="admin",
                ambito="general",
                texto="Bienvenidos al canal interno de Análisis Soberano 2.0. Desde aquí los visualizadores pueden debatir y enviar Solicitudes de Modificación de Panel (tanto para TDF como para el Ámbito Nacional).",
                fecha_hora=ahora_str
            ))
            db.add(MensajeChat(
                autor_nombre="Analista Equipo TDF",
                autor_rol="visualizador",
                ambito="tdf",
                texto="Excelente. Estuvimos revisando las métricas de los referentes provinciales y el nuevo monitor nacional para las elecciones.",
                fecha_hora=ahora_str
            ))
            db.commit()

        # 4. Asegurar datos base (métricas, debates, menciones) para todo político que aún no tenga
        todos_politicos = db.query(Politico).all()
        for pol in todos_politicos:
            tiene_metricas = db.query(MetricaImagen).filter(MetricaImagen.politico_id == pol.id).first()
            if not tiene_metricas:
                guardar_datos_politico(db, pol, usar_cv=False)
                db.commit()
    except Exception as e:
        db.rollback()
        print(f"Advertencia en asegurar_esquema_y_datos: {e}")
    finally:
        db.close()

asegurar_esquema_y_datos()

app = FastAPI(title="TDF & Nacional Politicos API")

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

# --- ENDPOINTS DE AUTENTICACIÓN Y PERFILES ---

class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = None

class CrearUsuarioRequest(BaseModel):
    username: str
    nombre_mostrar: str
    password: str
    rol: str = "visualizador"

@app.get("/usuarios")
def listar_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(Usuario).order_by(Usuario.id.asc()).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "nombre_mostrar": u.nombre_mostrar,
            "rol": u.rol
        }
        for u in usuarios
    ]

@app.post("/usuarios")
def crear_usuario(req: CrearUsuarioRequest, db: Session = Depends(get_db)):
    uname = req.username.strip().lower()
    if not uname or not req.nombre_mostrar.strip() or not req.password.strip():
        raise HTTPException(status_code=400, detail="Completa usuario, nombre y contraseña")
    existente = db.query(Usuario).filter(Usuario.username == uname).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ese nombre de usuario ya existe")
    nuevo = Usuario(
        username=uname,
        nombre_mostrar=req.nombre_mostrar.strip(),
        password=req.password.strip(),
        rol=req.rol if req.rol in ("admin", "visualizador") else "visualizador"
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return {
        "id": nuevo.id,
        "username": nuevo.username,
        "nombre_mostrar": nuevo.nombre_mostrar,
        "rol": nuevo.rol
    }

@app.delete("/usuarios/{user_id}")
def eliminar_usuario(user_id: int, db: Session = Depends(get_db)):
    u = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if u.username == "admin":
        raise HTTPException(status_code=400, detail="No se puede eliminar al Administrador principal")
    db.delete(u)
    db.commit()
    return {"status": "deleted"}

@app.post("/auth/login")
def login_usuario(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.username == req.username.strip().lower()).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    if not req.password or user.password != req.password:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    return {
        "id": user.id,
        "username": user.username,
        "nombre_mostrar": user.nombre_mostrar,
        "rol": user.rol
    }

# --- ENDPOINTS DE POLÍTICOS Y MÉTRICAS ---

@app.get("/politicos")
def read_politicos(ambito: Optional[str] = None, categoria: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Politico)
    if ambito:
        query = query.filter(Politico.ambito == ambito)
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

@app.get("/politicos/{politico_id}/debates")
def read_debates(politico_id: str, db: Session = Depends(get_db)):
    debates = db.query(DebatePublicacion).filter(DebatePublicacion.politico_id == politico_id).options(joinedload(DebatePublicacion.comentarios)).order_by(DebatePublicacion.fecha.desc()).all()
    result = []
    for d in debates:
        result.append({
            "id": d.id,
            "titulo": d.titulo,
            "contenido": d.contenido,
            "fecha": d.fecha.isoformat() if d.fecha else None,
            "fuente": d.fuente,
            "url": d.url,
            "comentarios": [
                {
                    "id": c.id,
                    "usuario": c.usuario,
                    "texto": c.texto,
                    "sentimiento": c.sentimiento,
                    "fecha": c.fecha.isoformat() if c.fecha else None
                } for c in d.comentarios
            ]
        })
    return result

@app.post("/simular")
async def run_extraccion_real(ambito: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Politico)
    if ambito:
        query = query.filter(Politico.ambito == ambito)
    politicos = query.all()
    if not politicos:
        return {"mensaje": "No hay políticos cargados en la base para este ámbito."}

    for pol in politicos:
        print(f"--- Iniciando extracción para: {pol.nombre} ({pol.ambito}) ---")
        try:
            db.query(MetricaImagen).filter(MetricaImagen.politico_id == pol.id).delete()
            db.query(MencionTexto).filter(MencionTexto.politico_id == pol.id).delete()
            
            debates_ids = [d.id for d in db.query(DebatePublicacion).filter(DebatePublicacion.politico_id == pol.id).all()]
            if debates_ids:
                db.query(ComentarioDebate).filter(ComentarioDebate.debate_id.in_(debates_ids)).delete(synchronize_session=False)
            db.query(DebatePublicacion).filter(DebatePublicacion.politico_id == pol.id).delete(synchronize_session=False)
            db.commit()

            guardar_datos_politico(db, pol, usar_cv=True)
            db.commit()
            print(f"✓ {pol.nombre} completado.")
        except Exception as e:
            db.rollback()
            print(f"✕ Falla scraper con {pol.nombre}: {e}")

    return {"mensaje": "Actualización de inteligencia completada."}

@app.post("/politicos/{politico_id}/scrappear")
async def run_scrappear_uno(politico_id: str, db: Session = Depends(get_db)):
    pol = db.query(Politico).filter(Politico.id == politico_id).first()
    if not pol:
        raise HTTPException(status_code=404, detail="Político no encontrado")

    print(f"--- Extracción FORZADA para: {pol.nombre} ({pol.ambito}) ---")
    try:
        db.query(MetricaImagen).filter(MetricaImagen.politico_id == pol.id).delete()
        db.query(MencionTexto).filter(MencionTexto.politico_id == pol.id).delete()
        
        debates_ids = [d.id for d in db.query(DebatePublicacion).filter(DebatePublicacion.politico_id == pol.id).all()]
        if debates_ids:
            db.query(ComentarioDebate).filter(ComentarioDebate.debate_id.in_(debates_ids)).delete(synchronize_session=False)
        db.query(DebatePublicacion).filter(DebatePublicacion.politico_id == pol.id).delete(synchronize_session=False)
        db.commit()

        guardar_datos_politico(db, pol, usar_cv=True)
        db.commit()
        return {"status": "success", "mensaje": f"Perfil de {pol.nombre} actualizado."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

class PoliticoSwapRequest(BaseModel):
    old_id: str
    new_nombre: str
    new_cargo: str

def ejecutar_reemplazo_interno(db: Session, old_id: str, new_nombre: str, new_cargo: str, usar_cv: bool = False):
    old_pol = db.query(Politico).filter(Politico.id == old_id).first()
    if not old_pol:
        raise HTTPException(status_code=404, detail="Político a reemplazar no encontrado")
    
    new_id = new_nombre.lower().strip()
    new_id = ''.join(c for c in unicodedata.normalize('NFD', new_id) if unicodedata.category(c) != 'Mn')
    new_id = re.sub(r'[^a-z0-9]', '', new_id)
    
    if not new_id:
        raise HTTPException(status_code=400, detail="Nombre del nuevo político no válido")
        
    existing = db.query(Politico).filter(Politico.id == new_id).first()
    if existing and existing.id != old_id:
        raise HTTPException(status_code=400, detail="Ya existe un político con ese nombre en el directorio")
        
    old_categoria = old_pol.categoria
    old_ambito = old_pol.ambito or "tdf"
    old_nombre = old_pol.nombre
    
    # Limpiar dependencias antes de eliminar
    db.query(MetricaImagen).filter(MetricaImagen.politico_id == old_pol.id).delete()
    db.query(MencionTexto).filter(MencionTexto.politico_id == old_pol.id).delete()
    debates_ids = [d.id for d in db.query(DebatePublicacion).filter(DebatePublicacion.politico_id == old_pol.id).all()]
    if debates_ids:
        db.query(ComentarioDebate).filter(ComentarioDebate.debate_id.in_(debates_ids)).delete(synchronize_session=False)
    db.query(DebatePublicacion).filter(DebatePublicacion.politico_id == old_pol.id).delete(synchronize_session=False)
    db.delete(old_pol)
    db.commit()
    
    new_pol = Politico(
        id=new_id,
        nombre=new_nombre.strip(),
        cargo=new_cargo.strip(),
        categoria=old_categoria,
        ambito=old_ambito
    )
    db.add(new_pol)
    db.commit()
    
    guardar_datos_politico(db, new_pol, usar_cv=usar_cv)
    db.commit()
    return old_nombre, new_pol

@app.post("/politicos/swap")
async def swap_politico(req: PoliticoSwapRequest, db: Session = Depends(get_db)):
    try:
        old_nombre, new_pol = ejecutar_reemplazo_interno(db, req.old_id, req.new_nombre, req.new_cargo, usar_cv=False)
        return {
            "status": "success",
            "mensaje": f"Se reemplazó a {old_nombre} por {new_pol.nombre}.",
            "new_id": new_pol.id,
            "new_politico": {
                "id": new_pol.id,
                "nombre": new_pol.nombre,
                "cargo": new_pol.cargo,
                "categoria": new_pol.categoria,
                "ambito": new_pol.ambito
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# --- ENDPOINTS DE CHAT INTERNO Y SOLICITUDES DE CAMBIO DE PANEL ---

class CrearSolicitudRequest(BaseModel):
    autor_nombre: str
    autor_rol: str
    ambito: str = "tdf"
    old_politico_id: str
    new_politico_nombre: str
    new_politico_cargo: str
    motivo: str

class ResolverSolicitudRequest(BaseModel):
    accion: str # 'aprobar' o 'rechazar'
    nota_admin: Optional[str] = ""
    admin_nombre: Optional[str] = "Administrador General"

class CrearMensajeChatRequest(BaseModel):
    autor_nombre: str
    autor_rol: str
    ambito: str = "general"
    texto: str

@app.get("/solicitudes")
def listar_solicitudes(ambito: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(SolicitudCambio)
    if ambito:
        query = query.filter(SolicitudCambio.ambito == ambito)
    return query.order_by(SolicitudCambio.id.desc()).all()

@app.post("/solicitudes")
def crear_solicitud(req: CrearSolicitudRequest, db: Session = Depends(get_db)):
    old_pol = db.query(Politico).filter(Politico.id == req.old_politico_id).first()
    if not old_pol:
        raise HTTPException(status_code=404, detail="La figura a reemplazar ya no se encuentra en el panel")

    ahora_str = datetime.now().strftime("%d/%m/%Y %H:%M")
    nueva = SolicitudCambio(
        autor_nombre=req.autor_nombre,
        autor_rol=req.autor_rol,
        ambito=old_pol.ambito or req.ambito,
        old_politico_id=old_pol.id,
        old_politico_nombre=old_pol.nombre,
        new_politico_nombre=req.new_politico_nombre.strip(),
        new_politico_cargo=req.new_politico_cargo.strip(),
        motivo=req.motivo.strip(),
        estado="pendiente",
        fecha_creacion=ahora_str
    )
    db.add(nueva)

    # Registrar aviso automático en el chat interno
    etiqueta_ambito = "Nacional" if (old_pol.ambito == "nacional") else "TDF"
    db.add(MensajeChat(
        autor_nombre=req.autor_nombre,
        autor_rol=req.autor_rol,
        ambito=old_pol.ambito or "tdf",
        texto=f"📋 [Solicitud #{etiqueta_ambito}] Solicito agregar a {req.new_politico_nombre.strip()} ({req.new_politico_cargo.strip()}) en reemplazo de {old_pol.nombre}. Motivo: {req.motivo.strip()}",
        fecha_hora=ahora_str
    ))
    db.commit()
    db.refresh(nueva)
    return nueva

@app.post("/solicitudes/{solicitud_id}/resolver")
def resolver_solicitud(solicitud_id: int, req: ResolverSolicitudRequest, db: Session = Depends(get_db)):
    sol = db.query(SolicitudCambio).filter(SolicitudCambio.id == solicitud_id).first()
    if not sol:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    if sol.estado != "pendiente":
        raise HTTPException(status_code=400, detail="Esta solicitud ya fue procesada")

    ahora_str = datetime.now().strftime("%d/%m/%Y %H:%M")
    if req.accion == "aprobar":
        old_nombre, new_pol = ejecutar_reemplazo_interno(
            db, sol.old_politico_id, sol.new_politico_nombre, sol.new_politico_cargo, usar_cv=False
        )
        sol.estado = "aprobada"
        sol.nota_admin = req.nota_admin or "Aprobado y ejecutado en el directorio."
        db.add(MensajeChat(
            autor_nombre=req.admin_nombre or "Administrador General",
            autor_rol="admin",
            ambito=sol.ambito,
            texto=f"✅ Solicitud aprobada: Se reemplazó a {old_nombre} por {new_pol.nombre} ({new_pol.cargo}) en el panel. {sol.nota_admin}",
            fecha_hora=ahora_str
        ))
        db.commit()
        return {
            "status": "success",
            "estado": "aprobada",
            "new_politico": {
                "id": new_pol.id,
                "nombre": new_pol.nombre,
                "cargo": new_pol.cargo,
                "categoria": new_pol.categoria,
                "ambito": new_pol.ambito
            }
        }
    elif req.accion == "rechazar":
        sol.estado = "rechazada"
        sol.nota_admin = req.nota_admin or "Solicitud desestimada por el administrador."
        db.add(MensajeChat(
            autor_nombre=req.admin_nombre or "Administrador General",
            autor_rol="admin",
            ambito=sol.ambito,
            texto=f"❌ Solicitud rechazada (propuesta: {sol.new_politico_nombre} por {sol.old_politico_nombre}). Nota: {sol.nota_admin}",
            fecha_hora=ahora_str
        ))
        db.commit()
        return {"status": "success", "estado": "rechazada"}
    else:
        raise HTTPException(status_code=400, detail="Acción inválida. Use 'aprobar' o 'rechazar'.")

@app.get("/chat")
def listar_mensajes_chat(limit: int = 50, db: Session = Depends(get_db)):
    mensajes = db.query(MensajeChat).order_by(MensajeChat.id.asc()).limit(limit).all()
    return mensajes

@app.post("/chat")
def enviar_mensaje_chat(req: CrearMensajeChatRequest, db: Session = Depends(get_db)):
    if not req.texto.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío")
    ahora_str = datetime.now().strftime("%d/%m/%Y %H:%M")
    msg = MensajeChat(
        autor_nombre=req.autor_nombre,
        autor_rol=req.autor_rol,
        ambito=req.ambito,
        texto=req.texto.strip(),
        fecha_hora=ahora_str
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

@app.get("/estado")
def read_estado():
    return {"status": "ok", "message": "API scraper, nacional, chat y db listos"}
