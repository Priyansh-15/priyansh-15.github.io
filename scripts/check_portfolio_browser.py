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

    assert page.locator("[data-scroll-stage]").count() == 8
    assert page.locator(".stage-cue--previous").count() == 5
    assert page.locator(".stage-cue--next").count() == 5

    overflow = page.evaluate(
        "document.documentElement.scrollWidth - document.documentElement.clientWidth"
    )
    assert overflow <= 2, f"Horizontal overflow at {width}x{height}: {overflow}px"

    if width > 800:
        assert page.locator(".desktop-nav").is_visible()
        hero_cue = page.locator('.stage-cue--hero a[href="#work"]')
        assert hero_cue.count() == 1, "Hero next-section cue must exist"
        hero_cue.click(timeout=6000)
        page.wait_for_timeout(1100)
        header = bounds(page, ".site-header")
        work = bounds(page, "#work")
        featured = bounds(page, ".story-featured")
        fleet = bounds(page, "#fleet-interactions")
        case_study_button = bounds(page, ".story-featured .case-study-link")
        diagram = bounds(page, ".story-featured .story-visual")
        print(
            f"{width}x{height}: work-top={work['top']:.0f}, "
            f"billing-content-bottom={max(case_study_button['bottom'], diagram['bottom']):.0f}, "
            f"fleet-top={fleet['top']:.0f}, header-bottom={header['bottom']:.0f}",
            flush=True,
        )
        assert abs(header["top"]) <= 3, "Sticky header not attached to viewport top"
        assert page.locator(".site-header.is-condensed").count() == 1
        landing_gap = work["top"] - header["bottom"]
        assert -2 <= landing_gap <= 32, (
            f"Work section not aligned after arrow navigation: {work}, {header}"
        )
        # Every featured topic owns a deliberate first view; a later project
        # must not peek into the current one on desktop. Content is never clipped.
        assert fleet["top"] >= height - 4, (
            f"Fleet appears in the billing screen at {width}x{height}: {fleet}"
        )
        assert case_study_button["bottom"] <= height - 4, (
            f"Billing CTA is cut off at {width}x{height}: {case_study_button}"
        )
        assert diagram["bottom"] <= height - 4, (
            f"Billing diagram is cut off at {width}x{height}: {diagram}"
        )
        assert page.evaluate("location.hash") == "#work", "Work URL does not match visible section"

        page.locator("#fleet-interactions").evaluate(
            "(el) => el.scrollIntoView({block: 'start', behavior: 'instant'})"
        )
        page.wait_for_timeout(450)
        fleet = bounds(page, "#fleet-interactions")
        ai = bounds(page, "#ai-code-intelligence")
        assert -2 <= fleet["top"] - bounds(page, ".site-header")["bottom"] <= 32
        assert ai["top"] >= height - 4, (
            f"AI preview appears in Fleet screen at {width}x{height}: {ai}"
        )
        assert page.evaluate("location.hash") == "#fleet-interactions", (
            "Fleet project URL is not synchronized"
        )

        page.locator("#ai-code-intelligence").evaluate(
            "(el) => el.scrollIntoView({block: 'start', behavior: 'instant'})"
        )
        page.wait_for_timeout(450)
        assert page.evaluate("location.hash") == "#ai-code-intelligence", (
            "Code Intelligence URL is not synchronized"
        )

        # Reverse scrolling must also return the correct project fragment.
        page.locator("#fleet-interactions").evaluate(
            "(el) => el.scrollIntoView({block: 'start', behavior: 'instant'})"
        )
        page.wait_for_timeout(450)
        assert page.evaluate("location.hash") == "#fleet-interactions", (
            "Upward scroll did not restore Fleet URL"
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
        clean = (
            -2 <= exp["top"] - header["bottom"] <= 32
            or abs(exp["top"] - height) < 24
        )
        assert clean, f"Boundary did not settle cleanly at {width}x{height}: {exp}"
        assert page.evaluate("location.hash") == "#experience", (
            "Experience fragment did not follow the scrolling position"
        )
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
        # Mobile topics may extend across screens, but their URLs still follow
        # the visitor and their full content must remain readable.
        page.locator("#ai-code-intelligence").evaluate(
            "(el) => el.scrollIntoView({block: 'start', behavior: 'instant'})"
        )
        page.wait_for_timeout(450)
        assert page.evaluate("location.hash") == "#ai-code-intelligence"
        print(f"{width}x{height}: mobile navigation, topic anchors and sticky header passed", flush=True)



    # Preserve campaign parameters and avoid growing browser history as a
    # visitor scrolls between two sections after arriving on a deep link.
    if width == 1512:
        page.goto(BASE + "?utm_source=chatgpt.com#contact", wait_until="load")
        page.wait_for_timeout(400)
        history_before = page.evaluate("history.length")
        page.locator("#work").evaluate(
            "(el) => el.scrollIntoView({block: 'start', behavior: 'instant'})"
        )
        page.wait_for_timeout(450)
        assert page.evaluate("location.search") == "?utm_source=chatgpt.com"
        assert page.evaluate("location.hash") == "#work"
        assert page.evaluate("history.length") == history_before


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
