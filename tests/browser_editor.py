"""Optional browser regression: python3 tests/browser_editor.py (requires Playwright + Chromium)."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from functools import partial
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PREFIX = '/preview/cbslicer'
class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        if path.startswith(PREFIX + '/'):
            path = path[len(PREFIX):]
        return super().translate_path(path)
    def log_message(self, *_):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        for prefix in ['', PREFIX]:
            page = browser.new_page(accept_downloads=True)
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            base = f'http://127.0.0.1:{server.server_port}{prefix}'
            page.goto(base + '/composite.html')
            page.wait_for_selector('#composite-board svg')
            assert page.locator('#editor-startup').is_hidden()
            for kind, count in [('triangle', 4), ('cube', 3), ('diamond', 13)]:
                page.locator('#kind').select_option(kind)
                assert page.locator('#motif [data-face]').count() == count
                page.locator('#brush').select_option('purpleheart')
                page.locator('#motif [data-face="0"]').focus()
                page.keyboard.press('Enter')
                assert page.locator('#motif [data-face="0"] polygon').get_attribute('fill') == '#794563'
                page.locator('#face-controls select').first.select_option('walnut')
                assert page.locator('#motif [data-face="0"] polygon').get_attribute('fill') == '#644431'
                page.locator('#blank').click()
                assert page.locator('#download').is_disabled()
                page.locator('#brush').select_option('maple')
                page.locator('#motif [data-face="0"]').focus()
                page.keyboard.press('Enter')
                assert page.locator('#motif [data-face="0"] polygon').get_attribute('fill') == '#e8c995'
                page.locator('#reset').click()
                assert page.locator('#download').is_enabled()
            assert page.locator('#diamond-architect').is_visible()
            original_motif = page.locator('#motif svg').inner_html()
            page.get_by_role('button', name='Fine line', exact=True).click()
            assert page.locator('#diamond-outer').input_value() == '12'
            assert page.locator('#motif svg').inner_html() != original_motif
            page.get_by_role('button', name='Bold frame', exact=True).click()
            assert page.locator('#diamond-outer').input_value() == '52'
            assert page.locator('#diamond-inner').input_value() == '18'
            page.locator('#save-project').click()
            page.reload()
            page.wait_for_selector('#motif svg')
            assert page.locator('#diamond-outer').input_value() == '52'
            assert page.locator('#diamond-inner').input_value() == '18'
            page.locator('#diamond-outer').evaluate("el=>{el.value='40';el.dispatchEvent(new Event('input',{bubbles:true}));}")
            assert page.locator('#diamond-outer').input_value() == '40'
            page.locator('#selection-mode').click()
            page.get_by_role('button', name='Checkerboard', exact=True).click()
            assert page.locator('.selected-unit').count() > 0
            page.locator('#turn-right').click()
            page.locator('#rotation-undo').click()
            page.goto(base + '/index.html')
            page.locator('.design-card').first.click()
            page.wait_for_selector('#composite-board svg')
            assert page.url.startswith(base + '/composite.html?design=')
            assert errors == [], errors
            page.close()
            print('PASS: family switching, wood selects, painting, blank/reset, rotation and collection navigation at', prefix or '/')
        page = browser.new_page()
        page.route('**/rotation-composer.js', lambda route: route.abort())
        page.goto(f'http://127.0.0.1:{server.server_port}/composite.html')
        page.wait_for_function("document.querySelector('#editor-startup').textContent.includes('could not start')")
        assert page.locator('#editor-startup').is_visible()
        print('PASS: missing module displays recovery instructions')
        browser.close()
finally:
    server.shutdown()
