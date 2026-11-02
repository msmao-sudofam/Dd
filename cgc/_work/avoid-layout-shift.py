from pathlib import Path
p=Path('cgc/_work/site.py');s=p.read_text(encoding='utf-8').replace('<body class="static-film">','<body>').replace('</head><body>','<noscript><style>#film{height:auto}.stage-list{display:block}.rail,.film-hud,.dims{display:none}.film-sticky{position:relative}</style></noscript></head><body>');p.write_text(s,encoding='utf-8')
p=Path('cgc/_work/main.js');s=p.read_text(encoding='utf-8-sig').replace("document.body.classList.add('static-film');","if(reduced.matches)document.body.classList.add('static-film');");p.write_text(s,encoding='utf-8')
p=Path('cgc/site/_test/functional.mjs');s=p.read_text(encoding='utf-8-sig').replace("p.locator('[data-act=close]').first().click()","p.locator('button[data-act=close]').click()");p.write_text(s,encoding='utf-8')
