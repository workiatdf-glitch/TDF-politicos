from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pytesseract
import cv2
import numpy as np
import urllib.parse
from playwright.async_api import async_playwright
import asyncio
import os
import layoutparser as lp

# Inicializar el modelo Detectron2 (PubLayNet suele ser excelente para identificar bloques de texto)
try:
    print("Iniciando carga de modelo LayoutParser (Detectron2)...")
    model_lp = lp.Detectron2LayoutModel(
        "lp://PubLayNet/faster_rcnn_R_50_FPN_3x/config",
        extra_config=["MODEL.ROI_HEADS.SCORE_THRESH_TEST", 0.5],
        label_map={0: "Text", 1: "Title", 2: "List", 3: "Table", 4: "Figure"}
    )
    print("Modelo cargado exitosamente.")
except Exception as e:
    print(f"Advertencia: No se pudo inicializar LayoutParser. Error: {e}")
    model_lp = None


app = FastAPI(title="TDF Politicos - CV Engine")

# Variables globales para Playwright
playwright_instance = None
browser_context = None

@app.on_event("startup")
async def startup_event():
    global playwright_instance, browser_context
    playwright_instance = await async_playwright().start()
    
    user_data_dir = "/app/playwright_context"
    if not os.path.exists(user_data_dir):
        os.makedirs(user_data_dir, exist_ok=True)
        
    browser_context = await playwright_instance.chromium.launch_persistent_context(
        user_data_dir=user_data_dir,
        headless=True,
        viewport={"width": 1280, "height": 800}
    )
    print("Contexto persistente de Playwright inicializado.")

@app.on_event("shutdown")
async def shutdown_event():
    global browser_context, playwright_instance
    if browser_context:
        await browser_context.close()
    if playwright_instance:
        await playwright_instance.stop()

class ScrapeRequest(BaseModel):
    nombre_politico: str

def extraer_texto_de_imagen(img, gray):
    custom_config = r'--oem 3 --psm 3'
    if model_lp is not None:
        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        layout = model_lp.detect(rgb_img)
        text_blocks = [b for b in layout if b.type in ["Text", "Title", "List"]]
        text_blocks = sorted(text_blocks, key=lambda b: b.coordinates[1])
        
        extracted_lines = []
        for block in text_blocks:
            segment_img = block.crop_image(gray)
            segment_text = pytesseract.image_to_string(segment_img, lang='spa', config=custom_config)
            if segment_text.strip():
                extracted_lines.append(segment_text.strip())
        return "\n\n".join(extracted_lines)
    else:
        return pytesseract.image_to_string(gray, lang='spa', config=custom_config)


@app.post("/api/scrape/facebook")
async def scrape_facebook(request: ScrapeRequest):
    nombre = request.nombre_politico
    query = urllib.parse.quote(f"{nombre} Tierra del Fuego")
    search_url = f"https://www.facebook.com/public/{query}"
    
    page = await browser_context.new_page()
    try:
        await page.goto(search_url, wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(3000)
        try:
            close_btn = page.locator("[aria-label='Cerrar'], [aria-label='Close'], ._42ft._4jy0._9o-t")
            if await close_btn.count() > 0:
                await close_btn.first.click()
        except Exception:
            pass
            
        await page.mouse.wheel(0, 500)
        await page.wait_for_timeout(2000)
        
        screenshot_bytes = await page.screenshot(full_page=False)
    except Exception as e:
        await page.close()
        return {"politico": nombre, "texto_extraido": "", "error": str(e), "status": "partial_fail"}
    
    await page.close()
    
    nparr = np.frombuffer(screenshot_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.convertScaleAbs(gray, alpha=1.5, beta=0)
    
    extracted_text = extraer_texto_de_imagen(img, gray)
    
    return {"politico": nombre, "texto_extraido": extracted_text, "url_visitada": search_url, "status": "success"}

@app.post("/api/scrape/x")
async def scrape_x(request: ScrapeRequest):
    nombre = request.nombre_politico
    query = urllib.parse.quote(f"{nombre}")
    search_url = f"https://x.com/search?q={query}&src=typed_query"
    
    page = await browser_context.new_page()
    try:
        await page.goto(search_url, wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(4000) # X toma más en cargar la SPA
        await page.mouse.wheel(0, 500)
        await page.wait_for_timeout(2000)
        screenshot_bytes = await page.screenshot(full_page=False)
    except Exception as e:
        await page.close()
        return {"politico": nombre, "texto_extraido": "", "error": str(e), "status": "partial_fail"}
        
    await page.close()

    nparr = np.frombuffer(screenshot_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.convertScaleAbs(gray, alpha=1.5, beta=0)
    
    extracted_text = extraer_texto_de_imagen(img, gray)
    return {"politico": nombre, "texto_extraido": extracted_text, "url_visitada": search_url, "status": "success"}

@app.post("/api/scrape/ig")
async def scrape_ig(request: ScrapeRequest):
    nombre = request.nombre_politico
    query = urllib.parse.quote(nombre.replace(" ", "").lower())
    search_url = f"https://www.instagram.com/explore/tags/{query}/"
    
    page = await browser_context.new_page()
    try:
        await page.goto(search_url, wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(4000)
        await page.mouse.wheel(0, 500)
        await page.wait_for_timeout(2000)
        screenshot_bytes = await page.screenshot(full_page=False)
    except Exception as e:
        await page.close()
        return {"politico": nombre, "texto_extraido": "", "error": str(e), "status": "partial_fail"}
        
    await page.close()

    nparr = np.frombuffer(screenshot_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.convertScaleAbs(gray, alpha=1.5, beta=0)
    
    extracted_text = extraer_texto_de_imagen(img, gray)
    return {"politico": nombre, "texto_extraido": extracted_text, "url_visitada": search_url, "status": "success"}


# ──────────────────────────────────────────────
# NUEVO: Endpoint de Búsqueda de Menciones
# ──────────────────────────────────────────────

def generar_variantes_busqueda(nombre: str):
    """Genera variantes del nombre para ampliar la búsqueda de menciones."""
    partes = nombre.strip().split()
    variantes = [nombre]  # Nombre completo
    if len(partes) >= 2:
        variantes.append(partes[-1])  # Solo apellido
        variantes.append(f"{partes[0]} {partes[-1]}")  # Nombre + apellido
    # Hashtag sin espacios
    variantes.append("#" + nombre.replace(" ", "").lower())
    if len(partes) >= 2:
        variantes.append("#" + partes[-1].lower())
    return variantes

def construir_url_menciones(red: str, nombre: str):
    """Construye la URL de búsqueda de menciones según la red social."""
    query = urllib.parse.quote(f"{nombre} Tierra del Fuego")
    query_simple = urllib.parse.quote(nombre)

    if red == "facebook":
        return f"https://www.facebook.com/search/posts/?q={query}"
    elif red == "x":
        return f"https://x.com/search?q={query_simple}+TDF&src=typed_query&f=live"
    elif red == "ig":
        # Instagram: buscar por hashtag del apellido
        partes = nombre.strip().split()
        tag = partes[-1].lower() if len(partes) >= 2 else nombre.replace(" ", "").lower()
        return f"https://www.instagram.com/explore/tags/{tag}tdf/"
    return ""

async def captura_multi_scroll(page, scrolls=3, wait_ms=2000):
    """Hace scroll progresivo y captura múltiples screenshots, extrae texto de cada uno."""
    textos = []
    for i in range(scrolls):
        try:
            screenshot_bytes = await page.screenshot(full_page=False)
            nparr = np.frombuffer(screenshot_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            gray = cv2.convertScaleAbs(gray, alpha=1.5, beta=0)
            texto = extraer_texto_de_imagen(img, gray)
            if texto and len(texto.strip()) > 10:
                textos.append(texto.strip())
            await page.mouse.wheel(0, 600)
            await page.wait_for_timeout(wait_ms)
        except Exception as e:
            print(f"Error en scroll {i}: {e}")
    return textos

class MencionesRequest(BaseModel):
    nombre_politico: str
    variantes: list[str] = []

@app.post("/api/menciones/{red}")
async def buscar_menciones(red: str, request: MencionesRequest):
    """
    Busca menciones de un político en una red social específica.
    Hace scroll progresivo y captura múltiples screenshots para maximizar extracción.
    """
    if red not in ["facebook", "x", "ig"]:
        raise HTTPException(status_code=400, detail=f"Red no soportada: {red}")

    nombre = request.nombre_politico
    variantes = request.variantes or generar_variantes_busqueda(nombre)
    
    # Intentamos con las primeras 2 variantes más probables (Completo y Apellido+TDF)
    # Esto aumenta drásticamente los hits para nombres específicos como "Di Giglio"
    intentos = variantes[:2] 
    todos_los_textos = []
    
    for var in intentos:
        search_url = construir_url_menciones(red, var)
        if not search_url: continue
        
        print(f"  [CV-Engine] {red.upper()}: Intentando búsqueda con variante '{var}'...")
        page = await browser_context.new_page()
        try:
            await page.goto(search_url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(3000)

            # Cerrar popups
            close_selectors = ["[aria-label='Cerrar']", "[aria-label='Close']", "._42ft._4jy0._9o-t"]
            for sel in close_selectors:
                btn = page.locator(sel)
                if await btn.count() > 0:
                    await btn.first.click()
                    break

            textos_capturados = await captura_multi_scroll(page, scrolls=2, wait_ms=2000)
            if textos_capturados:
                todos_los_textos.extend(textos_capturados)
                await page.close()
                break # Encontramos resultados, salimos del bucle para ahorrar tiempo
        except Exception as e:
            print(f"Error en variante '{var}': {e}")
        finally:
            if not page.is_closed():
                await page.close()

    # Filtrar fragmentos que realmente mencionan al político
    menciones_relevantes = []
    nombre_lower = nombre.lower()
    apellido = nombre.split()[-1].lower() if len(nombre.split()) > 1 else nombre_lower

    for texto in todos_los_textos:
        lineas = texto.split('\n')
        for linea in lineas:
            linea_clean = linea.strip()
            if len(linea_clean) < 15:
                continue
            linea_lower = linea_clean.lower()
            # Verificar si la línea menciona al político por nombre o apellido
            if nombre_lower in linea_lower or apellido in linea_lower:
                menciones_relevantes.append(linea_clean)
            elif any(v.lower().replace("#", "") in linea_lower for v in variantes):
                menciones_relevantes.append(linea_clean)

    return {
        "politico": nombre,
        "red": red,
        "url_buscada": search_url,
        "menciones": menciones_relevantes,
        "total_fragmentos": len(menciones_relevantes),
        "textos_raw_capturados": len(todos_los_textos),
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
