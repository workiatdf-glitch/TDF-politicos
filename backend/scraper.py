import time
import random
from datetime import date
from duckduckgo_search import DDGS
import textblob # We might use this if needed, but heuristic is faster
import requests
import os
import concurrent.futures

# Diccionarios de heurística básica en español
POS_WORDS = ['inauguracion', 'obra', 'mejora', 'crecimiento', 'acuerdo', 'consenso', 
             'solucion', 'apoyo', 'bien', 'mejor', 'éxito', 'logro', 'avance', 
             'beneficio', 'aumento', 'refuerzo', 'entrega', 'creacion', 'positivo',
             'festejo', 'reconocimiento', 'destacado', 'fondos', 'desarrollo']

NEG_WORDS = ['denuncia', 'escandalo', 'crisis', 'paro', 'reclamo', 'inflacion',
             'desempleo', 'corrupcion', 'culpa', 'rechazo', 'mal', 'peor',
             'conflicto', 'tragedia', 'inseguridad', 'robo', 'delito', 'problema',
             'corte', 'violencia', 'fuego', 'quemaron', 'ajuste', 'negativo', 'deuda']

def analizar_sentimiento(texto: str):
    texto_norm = texto.lower()
    import unicodedata
    texto_norm = ''.join(c for c in unicodedata.normalize('NFD', texto_norm)
                         if unicodedata.category(c) != 'Mn')
    
    pos_score = sum(1 for w in POS_WORDS if w in texto_norm)
    neg_score = sum(1 for w in NEG_WORDS if w in texto_norm)
    
    if pos_score > neg_score:
        return 'pos'
    elif neg_score > pos_score:
        return 'neg'
    return 'neu'

def buscar_noticias_reales(nombre_politico: str):
    """
    Búsqueda dorking orientada exclusivamente al 'Módulo Fueguino'.
    Forzamos leer únicamente desde los diarios explícitamente solicitados.
    Se añade una regla especial para pescar artículos sobre encuestas locales.
    """
    resultados = []
    
    # Dork query restrictivo hacia la prensa fueguina (10 portales)
    dork_sites = "(site:cronicasfueguinas.com OR site:cronicasrg.com.ar OR site:resumenpolicial.com.ar OR site:sureno.com.ar OR site:airelibre.com.ar OR site:actualidadtdf.com.ar OR site:minutofueguino.com.ar OR site:tiempofueguino.com OR site:19640noticias.com OR site:red23noticias.com.ar)"
    
    query_general = f'"{nombre_politico}" {dork_sites}'
    query_encuestas = f'"{nombre_politico}" (encuesta OR consultora OR sondeo OR "imagen positiva" OR "intención de voto") {dork_sites}'
    
    try:
        with DDGS() as ddgs:
            # 1. Búsqueda de noticias generales
            req_text = list(ddgs.text(query_general, max_results=10))
            for r in req_text:
                resultados.append(r.get('title', '') + " " + r.get('body', ''))
                
            # 2. Regla Especial: Búsqueda enfocada en encuestas
            req_encuestas = list(ddgs.text(query_encuestas, max_results=5))
            for r in req_encuestas:
                texto_encuesta = r.get('title', '') + " " + r.get('body', '')
                # Le damos el doble de peso en el array de resultados
                # porque un artículo de encuesta define el sentimiento mejor que una nota común
                resultados.append(texto_encuesta)
                resultados.append(texto_encuesta)
                
    except Exception as e:
        print(f"Error extrayendo para {nombre_politico} en Módulo Fueguino: {e}")

    return resultados

def procesar_red_visual(nombre_politico: str, red: str):
    """
    Se comunica con el microservicio cv-engine por la red de Docker
    para solicitar la captura y el texto OCR de la red social especificada.
    """
    cv_url = os.environ.get("CV_ENGINE_URL", "http://cv_engine:8000")
    try:
        res = requests.post(
            f"{cv_url}/api/scrape/{red}",
            json={"nombre_politico": nombre_politico},
            timeout=35 # La automatización de Playwright puede tardar
        )
        if res.status_code == 200:
            data = res.json()
            return data.get("texto_extraido", "")
    except Exception as e:
        print(f"Error accediendo a cv-engine ({red}) para {nombre_politico}: {e}")
    return ""

def procesar_facebook_visual(nombre_politico: str):
    return procesar_red_visual(nombre_politico, "facebook")

def procesar_x_visual(nombre_politico: str):
    return procesar_red_visual(nombre_politico, "x")

def procesar_ig_visual(nombre_politico: str):
    return procesar_red_visual(nombre_politico, "ig")

def buscar_menciones_sociales(nombre_politico: str):
    """
    Llama al cv-engine para buscar menciones del político en Facebook, X e Instagram.
    Cada mención encontrada vale 1.5x (más que una noticia, menos que una encuesta).
    Retorna: (textos_ponderados: list, conteo_menciones: int)
    """
    cv_url = os.environ.get("CV_ENGINE_URL", "http://cv_engine:8000")
    textos_menciones = []
    total_menciones = 0

    def buscar_en_red(red):
        try:
            res = requests.post(
                f"{cv_url}/api/menciones/{red}",
                json={"nombre_politico": nombre_politico},
                timeout=45  # Multi-scroll tarda más
            )
            if res.status_code == 200:
                data = res.json()
                menciones = data.get("menciones", [])
                print(f"  ↳ {red.upper()}: {len(menciones)} menciones encontradas para {nombre_politico}")
                return menciones
        except Exception as e:
            print(f"  ↳ Error buscando menciones en {red} para {nombre_politico}: {e}")
        return []

    # Buscar en paralelo en las 3 redes
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        fut_fb = executor.submit(buscar_en_red, "facebook")
        fut_x  = executor.submit(buscar_en_red, "x")
        fut_ig = executor.submit(buscar_en_red, "ig")

        menciones_fb = fut_fb.result()
        menciones_x  = fut_x.result()
        menciones_ig = fut_ig.result()

    todas = menciones_fb + menciones_x + menciones_ig
    total_menciones = len(todas)

    # Aplicar peso 1.5x: cada mención se agrega 1 vez normal + 1 vez extra (parcial)
    # Esto se traduce en agregar cada mención como texto + una copia extra cada 2
    for i, mencion in enumerate(todas):
        textos_menciones.append(mencion)
        if i % 2 == 0:  # 50% extra = peso efectivo ~1.5x
            textos_menciones.append(mencion)

    return textos_menciones, total_menciones


def generar_timeline_hibrido(nombre_politico: str, fechas: list):
    """
    Llama al scraper y con ello ancla el sentimiento.
    Ahora integra: Prensa TDF (10 portales) + Encuestas + Menciones Sociales (FB, X, IG).
    """
    textos = buscar_noticias_reales(nombre_politico)
    noticias_count = len(textos)

    # Extraer también de redes sociales con el servicio visual (scrape genérico)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        fut_fb = executor.submit(procesar_facebook_visual, nombre_politico)
        fut_x  = executor.submit(procesar_x_visual, nombre_politico)
        fut_ig = executor.submit(procesar_ig_visual, nombre_politico)
        
        texto_fb = fut_fb.result()
        texto_x  = fut_x.result()
        texto_ig = fut_ig.result()

    textos_redes = [texto_fb, texto_x, texto_ig]
    for txt_red in textos_redes:
        if txt_red and len(txt_red) > 20: 
            lineas = txt_red.split('\n')
            textos.extend([l for l in lineas if len(l) > 15])

    # NUEVO: Buscar menciones específicas en redes sociales
    print(f"  🔍 Buscando menciones sociales para {nombre_politico}...")
    textos_menciones, total_menciones = buscar_menciones_sociales(nombre_politico)
    textos.extend(textos_menciones)
    
    pos_news = 0
    neg_news = 0
    neu_news = 0
    
    for t in textos:
        st = analizar_sentimiento(t)
        if st == 'pos': pos_news += 1
        elif st == 'neg': neg_news += 1
        else: neu_news += 1
        
    total = pos_news + neg_news + neu_news
    if total > 0:
        base_pos_actual = (pos_news / total) * 100
        base_neg_actual = (neg_news / total) * 100
        base_neu_actual = (neu_news / total) * 100
        # Leyenda detallada con desglose de fuentes
        fuente_leyenda = f"Prensa TDF ({noticias_count}) + Menciones Sociales ({total_menciones}) = {total} fuentes"
    else:
        # Tercera o Segunda línea con exposición mínima
        base_pos_actual = 25
        base_neg_actual = 20
        base_neu_actual = 55
        fuente_leyenda = "Baja Cobertura Mediática Actual (Dato Base)"

    # Limitar extremos (para no dar 100% absoluto por tener 1 titulo bueno)
    base_pos_actual = min(max(base_pos_actual, 10), 60)
    base_neg_actual = min(max(base_neg_actual, 10), 60)
    base_neu_actual = 100 - base_pos_actual - base_neg_actual

    # Generamos la tira temporal (hacia atras desde la realidad)
    timeline = []
    
    current_pos = base_pos_actual
    current_neu = base_neu_actual
    
    # Recorremos de atrás hacia adelante para construir la historia
    for count, f in enumerate(fechas):
        b_pos = base_pos_actual + random.uniform(-15, 15)
        b_neu = base_neu_actual + random.uniform(-10, 10)
        
        b_pos = max(5, min(70, b_pos))
        b_neu = max(5, min(60, b_neu))
        b_neg = 100 - b_pos - b_neu
        
        if b_neg < 0:
            b_pos += b_neg/2
            b_neu += b_neg/2
            b_neg = 0

        timeline.append({
            "fecha": f,
            "pos": round(b_pos, 2),
            "neu": round(b_neu, 2),
            "neg": round(b_neg, 2),
            "fuente": fuente_leyenda if f.year >= 2023 else "Histórico Emulado"
        })
        
    return timeline

