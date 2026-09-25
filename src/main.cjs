const {app,BrowserWindow,ipcMain,clipboard,shell,dialog,session,Menu}=require('electron');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {Store}=require('./store.cjs');
const {normalize,postText,printHtml}=require('./domain.cjs');
if(process.env.AI_NEWS_TEST_DIR) app.setPath('userData',process.env.AI_NEWS_TEST_DIR);
const locked=app.requestSingleInstanceLock();
let win,store,refreshPromise;
if(!locked) app.quit();
else {
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.show();win.focus();}});
app.whenReady().then(async()=>{
  store=new Store(app.getPath('userData'));
  try {await store.load();} catch(e){dialog.showErrorBox('Błąd biblioteki',e.message);app.quit();return;}
  Menu.setApplicationMenu(null);
  session.defaultSession.setPermissionRequestHandler((_w,_p,cb)=>cb(false));
  session.defaultSession.setPermissionCheckHandler(()=>false);
  const entry=pathToFileURL(path.join(__dirname,'index.html')).href;
  const handle=(name,fn)=>ipcMain.handle(name,async(e,...args)=>{
    if(e.sender!==win.webContents||e.senderFrame.url!==entry)throw Error('Niedozwolone wywołanie');
    return fn(...args);
  });
  const find=id=>{const n=store.data.news.find(n=>n.id===id)||store.data.favorites[id];if(!n)throw Error('Nie znaleziono posta');return n;};
  handle('library',()=>store.data);
  handle('refresh',()=>{
    if(refreshPromise)return refreshPromise;
    refreshPromise=(async()=>{
      const url='https://aievolutionnews.live/api/news?refresh='+Date.now();
      const response=await fetch(url,{headers:{Accept:'application/json','Cache-Control':'no-cache',Pragma:'no-cache'},signal:AbortSignal.timeout(20000),redirect:'error'});
      if(!response.ok)throw Error('Serwis zwrócił błąd HTTP '+response.status);
      const text=await response.text();if(text.length>15000000)throw Error('Zbyt duża odpowiedź serwisu');
      const news=normalize(JSON.parse(text));store.data.news=news;store.data.updated=new Date().toISOString();await store.save();return store.data;
    })().finally(()=>refreshPromise=null);return refreshPromise;
  });
  handle('favorite',async id=>{if(typeof id!=='string')throw Error('Nieprawidłowy identyfikator');const n=find(id);const old=store.data.favorites;const next={...old};if(Object.hasOwn(next,id))delete next[id];else Object.defineProperty(next,id,{value:n,enumerable:true,configurable:true,writable:true});store.data.favorites=next;try{await store.save();}catch(e){store.data.favorites=old;throw e;}return store.data.favorites;});
  handle('theme',async theme=>{if(!['light','dark','system'].includes(theme))throw Error('Nieprawidłowy motyw');store.data.theme=theme;await store.save();});
  handle('copy',id=>{clipboard.writeText(postText(find(id)));return true;});
  handle('open',id=>shell.openExternal('https://aievolutionnews.live/#news-'+encodeURIComponent(find(id).id)));
  handle('print',async id=>{
    const n=find(id);const printWindow=new BrowserWindow({show:false,parent:win,webPreferences:{sandbox:true,contextIsolation:true,nodeIntegration:false}});
    try{await printWindow.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent(printHtml(n)));
      return await new Promise(resolve=>printWindow.webContents.print({silent:false,printBackground:false},(success,reason)=>resolve({success,reason})));
    }finally{printWindow.destroy();}
  });
  win=new BrowserWindow({title:'AI News',width:1440,height:940,minWidth:960,minHeight:640,backgroundColor:'#101820',show:!process.env.AI_NEWS_TEST_DIR,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,sandbox:true,nodeIntegration:false}});
  win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());
  await win.loadFile(path.join(__dirname,'index.html'));
});
app.on('window-all-closed',()=>app.quit());
}
