from pathlib import Path
p=Path('cgc/site/_test/qa.mjs');s=p.read_text(encoding='utf-8-sig').replace("if([360,1440].includes(width)){for", "if([360,1440].includes(width)){await page.evaluate(()=>scrollTo(0,1));await page.waitForFunction(()=>document.querySelector('#scene').dataset.engine);for");p.write_text(s,encoding='utf-8')
p=Path('cgc/site/_test/dev-server.mjs');s=p.read_text(encoding='utf-8').replace("const types={", "const types={'.woff2':'font/woff2',");p.write_text(s,encoding='utf-8')
