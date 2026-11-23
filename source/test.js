const { chromium } = require(process.env.PW || 'playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 860 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + __dirname + '/preview.html');
  let ids = await p.evaluate(() => TOOLS.map(t => t.id));
  const want = (process.argv[2] || '').split(',').filter(x => x && x !== 'all' && x !== 'none'); if (want.length) ids = ids.filter(i => want.includes(i));
  const shots = (process.argv[2] || '').split(',').filter(Boolean);
  if (process.argv[3]) await p.emulateMedia({ colorScheme: process.argv[3] });
  await p.screenshot({ path: 'shots/home.png' });
  for (const id of ids) {
    const before = errs.length;
    await p.evaluate(id => App.open(id), id);
    await p.waitForTimeout(250);
    // click every dock button once
    const n = await p.$$eval('.dock button', bs => bs.length);
    for (let i = 0; i < n; i++) { try { await p.evaluate(i => { const b = document.querySelectorAll('.dock button')[i]; b && b.click(); }, i); } catch (e) { } }
    await p.waitForTimeout(300);
    // click some stage elements
    await p.evaluate(() => { document.querySelectorAll('.stage .hit').forEach((e, i) => { if (i < 30) e.dispatchEvent(new MouseEvent('click', { bubbles: true })); }); });
    await p.waitForTimeout(200);
    await p.evaluate(id => App.open(id), id); await p.waitForTimeout(500);
    if (shots.includes(id) || shots.includes('all')) await p.screenshot({ path: 'shots/' + id + '.png' });
    console.log(id, errs.length - before ? 'ERRORS' : 'ok');
  }
  console.log(errs.join('\n')); await b.close();
})();
