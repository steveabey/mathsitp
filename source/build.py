import glob,sys,time
css=open('core.css',encoding='utf-8').read()
js=open('core.js',encoding='utf-8').read().replace('__BUILD__',time.strftime('%d %b %Y'))+'\n'+'\n'.join(open(f,encoding='utf-8').read() for f in sorted(glob.glob('t_*.js')))
html=f'''<title>ITP Studio</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Lilita+One&family=Nunito:wght@600;700;800;900&family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&display=swap">
<style>{css}</style>
<main id="home"></main>
<section id="tool" hidden></section>
<script>
{js}
App.init();
</script>
'''
open('itp-studio.html','w',encoding='utf-8').write(html)
open('preview.html','w',encoding='utf-8').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+html+'</body></html>')
print(len(html))
