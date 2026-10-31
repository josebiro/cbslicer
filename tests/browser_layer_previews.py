"""Run with npm run dev active: python3 tests/browser_layer_previews.py [base-url]."""
import sys
BASE=(sys.argv[1] if len(sys.argv)>1 else "http://127.0.0.1:3000").rstrip("/")
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for assembly in ['strips','squares']:
  for shaping in ['none','bevel45']:
   page.goto(BASE+'/composite.html?design=heirloom');page.wait_for_selector('#composite-board svg')
   page.locator('#bar-assembly').select_option(assembly);page.locator('#bar-shaping').select_option(shaping)
   original=page.locator('#composite-board').inner_html()
   a_preview=page.locator('[data-live-bar="A"] .bar-diagrams').inner_html()
   page.locator('button[data-move="1"][data-bar="A"]').first.click()
   assert page.locator('#composite-board').inner_html()!=original
   assert page.locator('[data-live-bar="A"] .bar-diagrams').inner_html()!=a_preview
   page.locator('button[data-move="-1"][data-bar="A"]').nth(1).click()
   assert page.locator('#composite-board').inner_html()==original
   b_preview=page.locator('[data-live-bar="B"] .bar-diagrams').inner_html()
   page.locator('button[data-move="1"][data-bar="B"]').first.click()
   assert page.locator('[data-live-bar="B"] .bar-diagrams').inner_html()!=b_preview
   assert page.locator('#composite-board').inner_html()==original
   assert 'Not used' in page.locator('[data-live-bar="B"] .bar-usage').inner_text()
   page.locator('[data-use-bar="B"]').click()
   assert page.locator('#composite-board').inner_html()!=original
   used_board=page.locator('#composite-board').inner_html()
   used_bar=page.locator('[data-live-bar="B"] .bar-diagrams').inner_html()
   page.locator('button[data-move="1"][data-bar="B"]').first.click()
   assert page.locator('#composite-board').inner_html()!=used_board
   assert page.locator('[data-live-bar="B"] .bar-diagrams').inner_html()!=used_bar
   if assembly=='strips':
    inp=page.locator('input[aria-label="Bar A layer 1 relative thickness"]')
    before=page.locator('#composite-board').inner_html()
    inp.fill('45')
    assert page.locator('#composite-board').inner_html()!=before
    assert inp.evaluate('(el)=>el===document.activeElement')
    first=page.locator('select[aria-label="Bar A layer 1 wood"]').input_value()
    page.locator('button[data-move="1"][data-bar="A"]').first.click()
    assert page.locator('select[aria-label="Bar A layer 2 wood"]').input_value()==first
   page.locator('#save-project').click();image=page.locator('#composite-board').inner_html()
   page.reload();page.wait_for_selector('#composite-board svg')
   assert page.locator('#composite-board').inner_html()==image
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert not errors,errors
 print('PASS: reorder/undo reorder across four recipes, live inactive B preview and explicit assignment, immediate weight update without blur, arrow after typing, persistence, mobile')
 b.close()
