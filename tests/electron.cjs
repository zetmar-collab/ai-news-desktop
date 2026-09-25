const {_electron:electron}=require('playwright');
const assert=require('node:assert/strict');const fs=require('node:fs/promises');const path=require('node:path');const os=require('node:os');
(async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'ainews-ui-'));let app;
 try{
 app=await electron.launch({args:['.'],env:{...process.env,AI_NEWS_TEST_DIR:dir}});const page=await app.firstWindow();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.locator('#all-count').filter({hasText:/[1-9]/}).waitFor({timeout:45000});await page.locator('#refresh:not([disabled])').waitFor();
 const count=Number(await page.locator('#all-count').innerText());assert.ok(count>0);console.log('LIVE API:',count,'posts');
 await page.locator('.post-open').first().click();const title=await page.locator('#reader h2').innerText();
 await page.locator('.actions button').first().click();await page.locator('#fav-count').filter({hasText:'1'}).waitFor();
 await page.getByRole('button',{name:'⧉ Kopiuj',exact:true}).click();const copied=await app.evaluate(({clipboard})=>clipboard.readText());assert.ok(copied.includes(title));assert.ok(copied.includes('https://aievolutionnews.live/#news-'));
 const html=require('../src/domain.cjs').printHtml((await page.evaluate(()=>window.newsApp.library())).news[0]);
 const pdf=await app.evaluate(async({BrowserWindow},html)=>{const w=new BrowserWindow({show:false});try{await w.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent(html));return Array.from(await w.webContents.printToPDF({pageSize:'A4'}));}finally{w.destroy();}},html);await fs.writeFile('test-results/article.pdf',Buffer.from(pdf));assert.ok(pdf.length>1000);
 await app.evaluate(({app})=>{app.on('browser-window-created',(_event,w)=>{w.webContents.print=(options,callback)=>{globalThis.testPrint={silent:options.silent};callback(false,'cancelled');};});});
 await page.getByRole('button',{name:'▤ Drukuj',exact:true}).click();await page.locator('#toast').filter({hasText:'Anulowano drukowanie.'}).waitFor();assert.deepEqual(await app.evaluate(()=>globalThis.testPrint),{silent:false});
 await page.locator('#toast').waitFor({state:'hidden'});
 await page.locator('#theme').selectOption('dark');await page.screenshot({path:'test-results/dark.png'});
 await page.locator('#theme').selectOption('light');await page.screenshot({path:'test-results/light.png'});
 await page.locator('#search').fill('zzzz-no-results-zzzz');assert.equal(await page.locator('.post').count(),0);await page.locator('#search').fill('');
 await page.locator('#sort').selectOption('az');const titles=await page.locator('.post h2').allTextContents();assert.deepEqual(titles,[...titles].sort((a,b)=>a.localeCompare(b,'pl')));
 await page.locator('[data-view="favorites"]').click();assert.equal(await page.locator('.post').count(),1);
 await app.close();app=null;
 app=await electron.launch({args:['.'],env:{...process.env,AI_NEWS_TEST_DIR:dir}});const restored=await app.firstWindow();await restored.locator('#fav-count').filter({hasText:'1'}).waitFor();assert.equal(await restored.locator('#theme').inputValue(),'light');
 await restored.locator('[data-view="favorites"]').click();assert.equal(await restored.locator('.post h2').innerText(),title);
 await restored.locator('.star').click();await restored.locator('#fav-count').filter({hasText:'0'}).waitFor();
 await restored.locator('#refresh:not([disabled])').waitFor();await app.evaluate(()=>{globalThis.fetch=async()=>{throw Error('test offline');};});await restored.locator('#refresh').click();await restored.locator('#connection.error').waitFor();assert.ok(Number(await restored.locator('#all-count').innerText())>0);
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(960,640));await restored.screenshot({path:'test-results/compact.png'});assert.ok(await restored.locator('#theme').isVisible());
 assert.deepEqual(errors,[]);console.log('PASS: live API, reader, favorites, persistence, clipboard, themes, search, sorting, PDF rendering; no renderer errors.');
 }finally{if(app)await app.close();await fs.rm(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
