"""Browser smoke test for the single-page portfolio's viewport and scroll experience."""
from __future__ import annotations

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8765/"


def bounds(page, selector: str) -> dict:
    return page.locator(selector).evaluate(
        "(el) => { const r = el.getBoundingClientRect(); "
        "return { top: r.top, bottom: r.bottom, height: r.height }; }"
    )


def scroll_to(page, javascript: str) -> None:
    page.evaluate(javascript)
    page.wait_for_timeout(1100)


def verify(page, width: int, height: int) -> None:
    page.goto(BASE, wait_until="domcontentloaded")
    page.locator("#work").wait_for()
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(250)

    assert page.locator("[data-scroll-stage]").count() == 6
    assert page.locator(".stage-cue--previous").count() == 5
    assert page.locator(".stage-cue--next").count() == 5

    overflow = page.evaluate(
        "document.documentElement.scrollWidth - document.documentElement.clientWidth"
    )
    assert overflow <= 2, f"Horizontal overflow at {width}x{height}: {overflow}px"

    if width > 800:
        assert page.locator(".desktop-nav").is_visible()
        page.locator('.stage-cue--hero a[href="#work"]').click()
        page.wait_for_timeout(1100)
        header = bounds(page, ".site-header")
        work = bounds(page, "#work")
        featured = bounds(page, ".story-featured")
        print(
            f"{width}x{height}: work-top={work['top']:.0f}, "
            f"featured-bottom={featured['bottom']:.0f}, "
            f"header-bottom={header['bottom']:.0f}, "
            f"remaining={height - featured['bottom']:.0f}",
            flush=True,
        )
        assert abs(header["top"]) <= 3, "Sticky header not attached to viewport top"
        assert page.locator(".site-header.is-condensed").count() == 1
        assert abs(work["top"] - header["bottom"]) <= 12, (
            f"Work section not aligned after arrow navigation: {work}, {header}"
        )
        # The user's reference viewport is 1512x832; maintain first project
        # visibility where the comfortable editorial layout can accommodate it.
        if width == 1512 and height == 832:
            assert featured["bottom"] <= height + 8, (
                f"Featured billing overview exceeds reference viewport: {featured['bottom']}"
            )

        # A programmatic wheel-like delta near the natural section end should
        # settle at a stage edge rather than leaving both stages half visible.
        scroll_to(
            page,
            "(() => { const e = document.querySelector('#experience'); "
            "window.scrollTo({top: e.getBoundingClientRect().top + "
            "window.scrollY - window.innerHeight + 130, behavior: 'instant'}); })()",
        )
        exp = bounds(page, "#experience")
        header = bounds(page, ".site-header")
        clean = abs(exp["top"] - header["bottom"]) < 18 or abs(exp["top"] - height) < 18
        assert clean, f"Boundary did not settle cleanly at {width}x{height}: {exp}"
    else:
        menu = page.locator("[data-menu-toggle]")
        assert menu.is_visible(), "Mobile menu toggle not visible"
        menu.click()
        assert menu.get_attribute("aria-expanded") == "true"
        assert page.locator('[data-mobile-nav] a[href="/#work"]').count() == 1
        menu.click()
        assert menu.get_attribute("aria-expanded") == "false"
        scroll_to(page, "window.scrollTo({top: 950, behavior:'instant'})")
        assert abs(bounds(page, ".site-header")["top"]) <= 3
        assert page.locator(".site-header.is-condensed").count() == 1
        print(f"{width}x{height}: mobile navigation and sticky header passed", flush=True)


def main() -> None:
    viewports = [(1512, 832), (1440, 900), (1366, 768), (390, 844), (360, 740)]
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True, args=["--no-sandbox"])
        for width, height in viewports:
            page = browser.new_page(
                viewport={"width": width, "height": height},
                device_scale_factor=1,
                reduced_motion="reduce",
            )
            try:
                verify(page, width, height)
            finally:
                page.close()
        browser.close()
    print("Portfolio viewport and boundary behavior verified.", flush=True)


if __name__ == "__main__":
    main()
