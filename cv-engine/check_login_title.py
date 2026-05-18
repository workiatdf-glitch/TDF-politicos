import asyncio
from playwright.async_api import async_playwright

async def check():
    async with async_playwright() as p:
        ctx = await p.chromium.launch_persistent_context(
            user_data_dir="/app/playwright_context",
            headless=True
        )
        page = await ctx.new_page()
        
        await page.goto("https://x.com/home", wait_until="domcontentloaded")
        await page.wait_for_timeout(3000)
        title_x = await page.title()
        
        print(f"X Title: {title_x}")
        await ctx.close()

asyncio.run(check())
