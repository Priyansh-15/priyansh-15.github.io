"""Audit real rendered layouts across desktop, scaled laptop, tablet, and phone sizes.

Runs against the built Astro site in Chrome, not static CSS approximations.
Keep output limited to geometry and an optional small set of viewport snapshots.
"""
from __future__ import annotations

import base64
import json
import os
import sys
from playwright.sync_api import sync_playwright

ROOT = "http://127.0.0.1:8765"
VIEWPORTS = [
    (2560, 1440), (1920, 1080), (1600, 900), (1536, 864), (1440, 900),
    (1366, 768), (1280, 720), (1024, 600), (1024, 768),
    (1100, 700), (900, 720), (820, 720), (801, 720),
    (800, 720), (768, 1024), (932, 430), (844, 390),
    (430, 932), (390, 844), (360, 740), (320, 568),
]
ROUTES = [
    ("/", "home"),
    ("/projects/", "projects"),
    ("/achievements/", "achievements"),
    ("/coding-profiles/", "coding"),
    ("/work/distributed-billing/", "billing"),
    ("/work/order-scheduler/", "fleet"),
]
# Render the screenshot exactly where a visitor lands, not an artificially
# compacted mockup. Browser snapshots are optional and are not committed.
SNAPSHOTS = {
    ("home", 1920, 1080, "work"),
    ("home", 1920, 1080, "explore"),
    ("home", 1920, 1080, "fleet"),
    ("home", 1920, 1080, "about"),
    ("home", 1920, 1080, "thinking"),
    ("home", 1920, 1080, "contact"),
    ("home", 390, 844, "contact"),
    ("home", 1366, 768, "work"),
    ("home", 390, 844, "top"),
    ("home", 820, 720, "top"),
    ("home", 820, 720, "work"),
    ("projects", 1024, 600, "top"),
    ("home", 1024, 600, "top"),
    ("projects", 1440, 900, "top"),
    ("achievements", 390, 844, "top"),
    ("coding", 390, 844, "top"),
    ("billing", 1366, 768, "top"),
}
SNAPSHOT_ENABLED = os.environ.get("AUDIT_SNAPSHOTS", "0") == "1"
FAIL_ON_OVERFLOW = os.environ.get("AUDIT_STRICT", "0") == "1"
violations = []


def rect(page, selector):
    if page.locator(selector).count() == 0:
        return None
    return page.locator(selector).first.evaluate(
        """el => {
          const r=el.getBoundingClientRect();
          return {x:Math.round(r.x),y:Math.round(r.y),
                  w:Math.round(r.width),h:Math.round(r.height),
                  bottom:Math.round(r.bottom),right:Math.round(r.right)};
        }"""
    )


def snapshot(page, label):
    jpeg=page.screenshot(type="jpeg",quality=42,full_page=False,animations="disabled")
    print(f"SNAPSHOT_BEGIN {label}", flush=True)
    print(base64.b64encode(jpeg).decode("ascii"), flush=True)
    print(f"SNAPSHOT_END {label}", flush=True)


def audit(page, name, width, height):
    page.goto(ROOT + ("/" if name == "home" else "/" + name + "/") if name in ("home","projects","achievements") else ROOT + {
        "coding":"/coding-profiles/","billing":"/work/distributed-billing/",
        "fleet":"/work/order-scheduler/"}[name],
        wait_until="domcontentloaded", timeout=25000)
    try:
        page.evaluate("() => Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,1500))])")
    except Exception:
        pass
    page.wait_for_timeout(65)
    info = page.evaluate("""() => {
        const d=document.documentElement;
        const els=[...document.querySelectorAll('main *')];
        const overflowing=els
          .filter(el=>{
            const r=el.getBoundingClientRect();
            const s=getComputedStyle(el);
            return (r.left < -4 || r.right > innerWidth + 4) &&
              r.width > 0 && r.height > 0 &&
              !['hidden','clip','auto','scroll'].includes(s.overflowX);
          })
          .slice(0,5)
          .map(el=>({tag:el.tagName,cls:(el.className?.baseVal || el.className || '').toString().slice(0,55)}));
        return {docWidth:d.scrollWidth,clientWidth:d.clientWidth,
          scrollHeight:d.scrollHeight,overflow:Math.round(d.scrollWidth-d.clientWidth),
          overflowing};
    }""")
    result={
       "route":name,"viewport":f"{width}x{height}",
       "overflow":info["overflow"],
       "docHeight":info["scrollHeight"],
       "header":rect(page, ".site-header"),
    }
    header_layout=page.evaluate("""() => {
        const get=(selector) => {
          const el=document.querySelector(selector);
          if(!el || getComputedStyle(el).display==='none')return null;
          const r=el.getBoundingClientRect();
          return {left:r.left,right:r.right};
        };
        return {brand:get('.brand'),nav:get('.desktop-nav'),actions:get('.header-actions')};
    }""")
    if header_layout["nav"]:
        nav=header_layout["nav"]
        brand=header_layout["brand"]
        actions=header_layout["actions"]
        if brand and nav["left"] < brand["right"] - 2:
            violations.append(f"{name} {width}x{height}: header brand overlaps nav")
        if actions and nav["right"] > actions["left"] + 2:
            violations.append(f"{name} {width}x{height}: header nav overlaps actions")
    if name == "home":
        if width <= 800:
            # The mobile hero can be taller than a screen: it should reflow,
            # never scale down to unreadable text or clip its note.
            result["hero"]=rect(page,".intro")
            result["heroNote"]=rect(page,".intro-aside")
        else:
            result["hero"]=rect(page,".intro")
            result["heroNote"]=rect(page,".intro-aside")
        if SNAPSHOT_ENABLED and (name,width,height,"top") in SNAPSHOTS:
            snapshot(page, f"home-top-{width}x{height}")
        page.locator("#work").evaluate(
            "(el)=>el.scrollIntoView({block:'start',behavior:'instant'})"
        )
        page.wait_for_timeout(80)
        intro=rect(page,"#work .section-intro-row")
        story=rect(page,"#work .story-featured")
        detail=rect(page,"#work .story-featured .story-detail")
        visual=rect(page,"#work .story-featured .story-visual")
        fleet=rect(page,"#fleet-interactions")
        cta=rect(page,"#work .story-featured .case-study-link")
        result["work"]={
          "introBottom":intro["bottom"] if intro else None,
          "storyTop":story["y"] if story else None,
          "detailTop":detail["y"] if detail else None,
          "visualTop":visual["y"] if visual else None,
          "ctaBottom":cta["bottom"] if cta else None,
          "visualBottom":visual["bottom"] if visual else None,
          "fleetTop":fleet["y"] if fleet else None,
          "gapIntroToStory":story["y"]-intro["bottom"] if story and intro else None,
          "gapIntroToDetail":detail["y"]-intro["bottom"] if detail and intro else None,
        }
        if (width >= 1100 and height >= 768 and
            detail["y"] - intro["bottom"] > 112):
            violations.append(
                f"{name} {width}x{height}: oversized gap "
                f"{detail['y']-intro['bottom']}px under section intro"
            )
        if width >= 1100 and height >= 768 and (
            cta["bottom"] > height - 4 or visual["bottom"] > height - 4
            or fleet["y"] < height - 4
        ):
            violations.append(
                f"{name} {width}x{height}: featured project not fully framed"
            )
        if SNAPSHOT_ENABLED and (name,width,height,"work") in SNAPSHOTS:
            snapshot(page,f"home-work-{width}x{height}")
        if width in (1920, 1366, 1024, 390):
            stages = {}
            for selector in ("#fleet-interactions", "#ai-code-intelligence",
                             "#experience", "#explore", "#about", "#thinking", "#contact"):
                page.locator(selector).evaluate(
                    "(el) => el.scrollIntoView({block: 'start', behavior: 'instant'})"
                )
                page.wait_for_timeout(30)
                stage = rect(page, selector)
                stages[selector] = {
                    "top": stage["y"] if stage else None,
                    "height": stage["h"] if stage else None,
                }
                stage_name = {
                    "#fleet-interactions": "fleet",
                    "#ai-code-intelligence": "ai",
                    "#experience": "experience",
                    "#explore": "explore",
                    "#about": "about",
                    "#thinking": "thinking",
                    "#contact": "contact",
                }[selector]
                if SNAPSHOT_ENABLED and (name,width,height,stage_name) in SNAPSHOTS:
                    page.wait_for_timeout(70)
                    snapshot(page, f"home-{stage_name}-{width}x{height}")
            result["stages"] = stages
            if width >= 1100 and height >= 768:
                usable = height - 64
                for marker in ("#about", "#thinking", "#contact"):
                    if stages[marker]["height"] < usable - 14:
                        violations.append(
                            f"{name} {width}x{height}: {marker} shorter than viewing frame"
                        )
                if abs(stages["#contact"]["top"] - 64) > 30:
                    violations.append(
                        f"{name} {width}x{height}: Contact cannot align below sticky header"
                    )
        if SNAPSHOT_ENABLED and (name,width,height,"explore") in SNAPSHOTS:
            page.locator("#explore").evaluate(
                "(el) => el.scrollIntoView({block: 'start', behavior: 'instant'})"
            )
            page.wait_for_timeout(80)
            snapshot(page,f"home-explore-{width}x{height}")
    else:
        sels={
          "projects":(".projects-hero",".projects-hero h1",".projects-section"),
          "achievements":(".ach-hero",".ach-hero h1",".ach-section"),
          "coding":(".coding-hero",".coding-hero h1",".coding-directory"),
          "billing":(".case-hero",".case-hero h1",".case-layout"),
          "fleet":(".case-hero",".case-hero h1",".case-layout"),
        }
        hero,title,first=sels[name]
        result["hero"]=rect(page,hero)
        result["heading"]=rect(page,title)
        result["firstContent"]=rect(page,first)
        heading_rect=result["heading"]
        if heading_rect and (heading_rect["x"] < -3 or heading_rect["right"] > width + 3):
            violations.append(f"{name} {width}x{height}: hero heading extends beyond viewport")
        if name in ("projects","achievements","coding") and (
            (width,height) in ((1024,600),(1280,720))
            and result["hero"]["bottom"] > height + 10
        ):
            violations.append(
                f"{name} {width}x{height}: oversized short-window intro exceeds viewport"
            )
        if SNAPSHOT_ENABLED and (name,width,height,"top") in SNAPSHOTS:
            snapshot(page,f"{name}-top-{width}x{height}")
    if info["overflow"]>2:
        violations.append(f"{name} {width}x{height}: horizontal overflow +{info['overflow']}px {info['overflowing']}")
    if (width, height) in (
        (1920,1080),(1024,600),(820,720),(390,844),(320,568)
    ):
        # The same geometry and overflow rules must survive theme changes.
        page.evaluate("document.documentElement.dataset.theme = 'light'")
        light_overflow = page.evaluate(
            "document.documentElement.scrollWidth - document.documentElement.clientWidth"
        )
        if light_overflow > 2:
            violations.append(
                f"{name} {width}x{height}: light-theme horizontal overflow +{light_overflow}px"
            )
        page.evaluate("document.documentElement.dataset.theme = 'dark'")
    print("MEASURE "+json.dumps(result,sort_keys=True,separators=(",",":")),flush=True)


def main():
    with sync_playwright() as playwright:
        browser=playwright.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox"])
        for w,h in VIEWPORTS:
            ctx=browser.new_context(viewport={"width":w,"height":h},reduced_motion="reduce")
            ctx.add_init_script("localStorage.setItem('portfolio-theme', 'dark')")
            page=ctx.new_page()
            for _,name in ROUTES:
                try:
                    audit(page,name,w,h)
                except Exception as exc:
                    violations.append(f"{name} {w}x{h}: {exc}")
                    print("AUDIT_ERROR "+repr(exc),flush=True)
            ctx.close()
        browser.close()
    print("AUDIT_SUMMARY "+json.dumps({"viewportCount":len(VIEWPORTS),"pageCount":len(ROUTES),"failures":violations}),flush=True)
    if FAIL_ON_OVERFLOW and violations:
        sys.exit(1)


if __name__ == "__main__":
    main()
