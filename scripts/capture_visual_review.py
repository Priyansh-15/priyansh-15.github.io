"""Capture browser renders of every route and homepage stage in both themes."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from audit_responsive import ROOT, ROUTES

OUT = Path("visual-review")
VIEWPORTS = [(1920, 1080), (1600, 900), (1366, 768), (1101, 620),
             (2560, 1440), (768, 1024), (1024, 768), (390, 844),
             (320, 568), (844, 390)]
STAGES = ["work", "fleet-interactions", "ai-code-intelligence",
          "experience", "explore", "about", "thinking", "contact"]

def capture(page, path):
    page.evaluate("document.fonts.ready")
    page.screenshot(path=str(path), animations="disabled", full_page=False)

def main():
    OUT.mkdir(exist_ok=True)
    manifest = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True, args=["--no-sandbox"])
        for width, height in VIEWPORTS:
            for theme in ("dark", "light"):
                context = browser.new_context(viewport={"width": width, "height": height},
                                              reduced_motion="reduce", device_scale_factor=1)
                context.add_init_script(f"localStorage.setItem('portfolio-theme', '{theme}')")
                page = context.new_page()
                folder = OUT / f"{width}x{height}" / theme
                folder.mkdir(parents=True, exist_ok=True)
                for route, name in ROUTES:
                    page.goto(ROOT + route, wait_until="load", timeout=30000)
                    path = folder / f"{name}-top.png"
                    capture(page, path)
                    manifest.append(str(path.relative_to(OUT)))
                    if name == "home":
                        for stage in STAGES:
                            page.locator("#" + stage).evaluate(
                                "(el) => el.scrollIntoView({block:'start',behavior:'instant'})")
                            page.wait_for_timeout(150)
                            path = folder / f"home-{stage}.png"
                            capture(page, path)
                            manifest.append(str(path.relative_to(OUT)))
                    else:
                        path = folder / f"{name}-full.png"
                        page.screenshot(path=str(path), animations="disabled", full_page=True)
                        manifest.append(str(path.relative_to(OUT)))
                context.close()
        browser.close()
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"Captured {len(manifest)} screenshots.")

if __name__ == "__main__":
    main()
