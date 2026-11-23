import os,shutil,json,zipfile,time
body=open('itp-studio.html',encoding='utf-8').read()
out='itp-studio-cloudflare'
shutil.rmtree(out,ignore_errors=True); os.makedirs(out)
reset=('<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
       'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>')
head=('<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n'
      '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
      '<meta name="description" content="Interactive maths teaching programs for the classroom board.">\n'
      '<meta name="theme-color" content="#0f3d45">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n'
      '<link rel="manifest" href="/manifest.webmanifest">\n'
      '<link rel="apple-touch-icon" href="/favicon.svg">\n'
      '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n'
      '<meta name="apple-mobile-web-app-title" content="ITP Studio">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'+reset+'\n')
i=body.index('<main id="home">')
html=head+body[:i]+'</head>\n<body class="homeview">\n'+body[i:]+'\n</body>\n</html>\n'
open(f'{out}/index.html','w',encoding='utf-8').write(html)
fav='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="10" fill="#0f3d45"/><rect x="7" y="8" width="34" height="32" rx="7" fill="#fffaf0" stroke="#1c1430" stroke-width="3"/><path d="M12 17h24M12 24h24M12 31h24" stroke="#1c1430" stroke-width="2"/><circle cx="17" cy="17" r="3.6" fill="#ff6b5b" stroke="#1c1430" stroke-width="1.6"/><circle cx="24" cy="24" r="3.6" fill="#ffcb3d" stroke="#1c1430" stroke-width="1.6"/><circle cx="31" cy="31" r="3.6" fill="#5cc2ff" stroke="#1c1430" stroke-width="1.6"/></svg>'''
open(f'{out}/favicon.svg','w',encoding='utf-8').write(fav)
# PNG icons are left out: the Cloudflare Workers uploader only takes HTML, CSS, JS and simple files

json.dump({"id":"/","name":"ITP Studio","short_name":"ITP Studio","description":"Interactive maths teaching programs for the classroom board.",
  "start_url":"./","scope":"./","display":"standalone","orientation":"any",
  "background_color":"#0f3d45","theme_color":"#0f3d45","categories":["education"],"lang":"en-GB",
  "icons":[{"src":"favicon.svg","sizes":"any","type":"image/svg+xml","purpose":"any"},{"src":"favicon.svg","sizes":"any","type":"image/svg+xml","purpose":"maskable"}]},
  open(f'{out}/manifest.webmanifest','w',encoding='utf-8'),indent=2)
# shrink the page (smaller uploads go through the Cloudflare dashboard more reliably)
import subprocess
mj='/home/claude/tools/minify.js'
if os.path.exists(mj):
    r=subprocess.run(['node',mj,f'{out}/index.html'],env=dict(os.environ,NODE_PATH='/home/claude/tools/node_modules'),capture_output=True,text=True); print(r.stdout.strip() or r.stderr.strip())
stamp=os.environ.get('ITP_STAMP') or time.strftime('%Y%m%d-%H%M%S')
files=['./','index.html','favicon.svg','manifest.webmanifest']
sw=open('sw.template.js',encoding='utf-8').read().replace('__VERSION__',stamp).replace('__FILES__',json.dumps(files))
open(f'{out}/sw.js','w',encoding='utf-8').write(sw)
z=zipfile.ZipFile('itp-studio-cloudflare.zip','w',zipfile.ZIP_DEFLATED)
for f in os.listdir(out): z.write(f'{out}/{f}',f)
z.close()
print('version',stamp,sorted(os.listdir(out)), os.path.getsize('itp-studio-cloudflare.zip'))
