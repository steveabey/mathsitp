import sys,re,glob
# usage: swap.py newfile.js  -> each tool({ id: 'x' ... }) in newfile replaces same id in t_*.js, or is appended to target file given by "// target: t_x.js"
new=open(sys.argv[1],encoding='utf-8').read()
target=re.search(r'// target: (\S+)',new).group(1)
blocks=re.split(r'(?=^tool\(\{)',new,flags=re.M)
for blk in blocks:
    m=re.search(r"^tool\(\{\s*id: '([^']+)'",blk)
    if not m: continue
    tid=m.group(1); blk=blk.rstrip()+'\n\n'
    done=False
    for f in glob.glob('t_*.js'):
        s=open(f,encoding='utf-8').read()
        st=s.find("tool({\n  id: '%s'"%tid)
        if st<0: continue
        en=s.find("\ntool({",st+5)
        en=len(s) if en<0 else en+1
        s=s[:st]+blk+s[en:]
        open(f,'w',encoding='utf-8').write(s); done=True; print('replaced',tid,'in',f); break
    if not done:
        s=open(target,encoding='utf-8').read().rstrip()+'\n\n'+blk
        open(target,'w',encoding='utf-8').write(s); print('added',tid,'to',target)
