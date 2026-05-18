import asyncio
from playwright.async_api import async_playwright

async def check():
    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            user_data_dir="/app/playwright_context",
            headless=True
        )
        page = await ctx.new_page()
        
        # Check X
        await page.goto("https://x.com/home", wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)
        url_x = page.url
        
        # Check Facebook
        await page.goto("https://www.facebook.com/", wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)
        url_fb = page.url
        
        print(f"X URL: {url_x}")
        print(f"FB URL: {url_fb}")
        
        await ctx.close()

asyncio.run(check())
