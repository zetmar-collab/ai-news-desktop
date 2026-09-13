const fs = require('node:fs/promises');
const path = require('node:path');
class Store {
  constructor(dir) { this.dir=dir; this.queue=Promise.resolve(); this.data={news:[],favorites:{},theme:'system',updated:null}; }
  async load() {
    try { const value=JSON.parse(await fs.readFile(path.join(this.dir,'library.json'),'utf8')); if(!Array.isArray(value.news)||!value.favorites||typeof value.favorites!=='object') throw Error('Nieprawidłowa biblioteka'); this.data={...this.data,...value}; }
    catch(e) { if(e.code!=='ENOENT') throw new Error('Nie można odczytać biblioteki. Plik został zachowany: '+e.message); }
    return this.data;
  }
  save() {
    const text=JSON.stringify(this.data);
    const operation=this.queue.catch(()=>{}).then(async()=>{await fs.mkdir(this.dir,{recursive:true}); const file=path.join(this.dir,'library.json'); await fs.writeFile(file+'.tmp',text,'utf8'); await fs.rename(file+'.tmp',file);});
    this.queue=operation; return operation;
  }
}
module.exports={Store};
