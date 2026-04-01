import os
from playwright.sync_api import sync_playwright

def login():
    context_dir = os.path.join(os.path.dirname(__file__), "playwright_context")
    if not os.path.exists(context_dir):
        os.makedirs(context_dir, exist_ok=True)
        
    print(f"Abriendo Chrome local. Las sesiones se guardaran en: {context_dir}")
    print("INSTRUCCIONES: Inicia sesion en X (Twitter), Facebook e Instagram.")
    print("Cuando termines, simplemente cierra todas las pestañas/navegador manualmente para finalizar.")

    with sync_playwright() as p:
        browser_context = p.chromium.launch_persistent_context(
            user_data_dir=context_dir,
            headless=False,
            viewport={"width": 1280, "height": 800}
        )
        
        page = browser_context.pages[0] if len(browser_context.pages) > 0 else browser_context.new_page()
        
        try:
            page.goto("https://www.facebook.com/")
            
            # Abrimos X y Instagram en pestañas nuevas
            p1 = browser_context.new_page()
            p1.goto("https://x.com/i/flow/login")
            
            p2 = browser_context.new_page()
            p2.goto("https://www.instagram.com/accounts/login/")
            
            # Mantiene el script vivo por 1 hora o hasta que detecte que cerramos el navegador
            page.wait_for_timeout(3600000) 
        except Exception:
            pass # Si el usuario cierra la ventana arrojará TargetClosed, lo cual es normal.
            
        print("Navegador cerrado. Cookies guardadas correctamente en playwright_context/")

if __name__ == "__main__":
    login()
