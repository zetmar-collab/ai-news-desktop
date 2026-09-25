const $=id=>document.getElementById(id);
const labels={ai:'Sztuczna inteligencja',models:'Modele AI',krypto:'Kryptowaluty',tech:'Technologia',swiat:'Świat',polska:'Polska',biznes:'Biznes',nauka:'Nauka',gaming:'Gaming',kosmos:'Kosmos',zdrowie:'Zdrowie',fun:'Ciekawostki',github:'GitHub'};
let library={news:[],favorites:{},theme:'system',updated:null},view='all',category='',selected=null,limit=40,toastTimer,busy=false;
const AUTO_REFRESH_MS=5*60*1000;
let lastRefreshAttempt=0;
function element(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
const saved=id=>Object.hasOwn(library.favorites,id);
const date=d=>d?new Date(d+'T12:00:00').toLocaleDateString('pl-PL',{day:'numeric',month:'short',year:'numeric'}):'Brak daty';
const minutes=n=>Math.max(1,Math.ceil(n.full.split(/\s+/).length/200));
const norm=s=>s.toLocaleLowerCase('pl').normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/ł/g,'l');
function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500);}
function applyTheme(){document.documentElement.dataset.theme=library.theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):library.theme;$('theme').value=library.theme;}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);
function allPosts(){return view==='favorites'?Object.values(library.favorites):library.news.filter(n=>view!=='hot'||n.hot);}
function filtered(){const words=norm($('search').value).split(/\s+/).filter(Boolean);return allPosts().filter(n=>(!category||n.category===category)&&words.every(w=>norm([n.title,n.full,n.source,labels[n.category]||n.category,...n.tags].join(' ')).includes(w))).sort((a,b)=>{switch($('sort').value){case'oldest':return a.date.localeCompare(b.date)||a.id.localeCompare(b.id,undefined,{numeric:true});case'az':return a.title.localeCompare(b.title,'pl');case'za':return b.title.localeCompare(a.title,'pl');default:return b.date.localeCompare(a.date)||b.id.localeCompare(a.id,undefined,{numeric:true});}});}
function renderNav(){
 $('all-count').textContent=library.news.length;$('fav-count').textContent=Object.keys(library.favorites).length;$('hot-count').textContent=library.news.filter(n=>n.hot).length;
 document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',b.dataset.view===view);});
 $('heading').textContent={all:'Wszystkie wiadomości',favorites:'Twoje ulubione',hot:'Na czasie'}[view];
 const cats=[...new Set([...library.news,...Object.values(library.favorites)].map(n=>n.category))];
 $('categories').replaceChildren();cats.sort((a,b)=>(labels[a]||a).localeCompare(labels[b]||b,'pl')).forEach(c=>{const b=element('button','nav'+(category===c?' active':''));b.setAttribute('aria-pressed',category===c);b.append(element('span','','●'),document.createTextNode(labels[c]||c),element('b','',allPosts().filter(n=>n.category===c).length));b.onclick=()=>{category=category===c?'':c;limit=40;render();};$('categories').append(b);});
 $('last-update').textContent=library.updated?'Synchronizacja: '+new Date(library.updated).toLocaleString('pl-PL'):'Jeszcze nie zsynchronizowano';
}
async function toggle(id){try{library.favorites=await window.newsApp.favorite(id);render();toast(saved(id)?'Zapisano w ulubionych — dostępne także offline.':'Usunięto z ulubionych.');}catch(e){toast('Nie udało się zapisać zmiany: '+e.message);}}
function render(){
 renderNav();const posts=filtered();if(selected&&!posts.some(n=>n.id===selected))selected=null;
 $('results').textContent=posts.length+' wiadomości'+(category?' · '+(labels[category]||category):'');$('posts').replaceChildren();
 if(!posts.length){const empty=element('div','empty');empty.append(element('h2','',view==='favorites'&&!Object.keys(library.favorites).length?'Twoja kolekcja czeka':'Brak pasujących wiadomości'),element('p','',view==='favorites'?'Zapisz post gwiazdką lub zmień filtry.':'Zmień wyszukiwanie, kategorię lub odśwież dane.'));$('posts').append(empty);}
 posts.slice(0,limit).forEach(n=>{
 const card=element('article','post'+(selected===n.id?' selected':''));const meta=element('div','post-meta');meta.append(element('span','badge',labels[n.category]||n.category),element('span','',date(n.date)));if(n.hot)meta.append(element('span','','ϟ'));
 const open=element('button','post-open');open.setAttribute('aria-label','Czytaj: '+n.title);open.setAttribute('aria-pressed',selected===n.id);open.append(element('h2','',n.title),element('p','',n.excerpt));open.onclick=()=>{selected=n.id;render();$('reader').scrollTop=0;};
 const star=element('button','star',saved(n.id)?'★':'☆');star.setAttribute('aria-label',(saved(n.id)?'Usuń z ulubionych: ':'Zapisz w ulubionych: ')+n.title);star.setAttribute('aria-pressed',saved(n.id));star.onclick=()=>toggle(n.id);
 const bottom=element('div','post-bottom');bottom.append(element('span','',n.source),element('span','',minutes(n)+' min czytania'));card.append(meta,star,open,bottom);$('posts').append(card);
 });$('more').hidden=posts.length<=limit;renderReader(posts.find(n=>n.id===selected));
}
function renderReader(n){
 const target=$('reader');target.replaceChildren();if(!n){const e=element('div','reader-empty');e.append(element('span','','▤'),element('h2','','Chwila na dobrą lekturę'),element('p','','Wybierz wiadomość z listy po lewej.\nPełna treść pojawi się właśnie tutaj.'));target.append(e);return;}
 target.append(element('div','reader-label','STREFA CZYTANIA  /  AI EVOLUTION NEWS'),element('span','badge',labels[n.category]||n.category),element('h2','',n.title),element('div','reader-meta',date(n.date)+' · '+minutes(n)+' min czytania\nŹródło: '+n.source));
 const actions=element('div','actions');const favorite=element('button','secondary'+(saved(n.id)?' saved':''),saved(n.id)?'★ Zapisano':'☆ Zapisz');favorite.setAttribute('aria-pressed',saved(n.id));favorite.onclick=()=>toggle(n.id);actions.append(favorite);
 for(const [name,label] of [['copy','⧉ Kopiuj'],['print','▤ Drukuj']]){const b=element('button','secondary',label);b.onclick=async()=>{b.disabled=true;try{const result=await window.newsApp[name](n.id);if(name==='copy')toast('Skopiowano pełną treść i link do schowka.');else if(!result.success)toast(/cancel/i.test(result.reason||'')?'Anulowano drukowanie.':'Nie wydrukowano: '+(result.reason||'Sprawdź dostępność drukarki.'));}catch(e){toast('Operacja nie powiodła się: '+e.message);}finally{b.disabled=false;}};actions.append(b);}
 target.append(actions,element('div','article-body',n.full));const tags=element('div','tags');n.tags.forEach(t=>tags.append(element('span','','#'+t)));target.append(tags);
 const foot=element('div','article-foot');foot.append(element('div','','Treść pochodzi z AI Evolution News. Serwis opracowuje wiadomości automatycznie z użyciem AI.'));const link=element('button','secondary','Otwórz post na stronie ↗');link.onclick=()=>window.newsApp.open(n.id).catch(e=>toast(e.message));foot.append(link);target.append(foot);
}
async function refresh({automatic=false}={}){if(busy||automatic&&Date.now()-lastRefreshAttempt<AUTO_REFRESH_MS)return;lastRefreshAttempt=Date.now();busy=true;$('refresh').disabled=true;$('refresh').querySelector('span').textContent='Pobieranie…';$('connection').className='';$('connection').textContent='Łączę z AI Evolution News…';try{library=await window.newsApp.refresh();$('connection').textContent='● Pobrano '+library.news.length+' wiadomości · Biblioteka dostępna również offline';render();}catch(e){$('connection').className='error';$('connection').textContent=(library.news.length?'Tryb offline — wyświetlam ostatnio zapisane wiadomości. ':'Nie udało się pobrać wiadomości. ')+ 'Kliknij Odśwież, aby spróbować ponownie.';}finally{busy=false;$('refresh').disabled=false;$('refresh').querySelector('span').textContent='Odśwież';}}
$('refresh').onclick=refresh;$('search').oninput=()=>{limit=40;render();};$('sort').onchange=()=>render();$('clear-category').onclick=()=>{category='';render();};$('more').onclick=()=>{limit+=40;render();};
$('library-nav').onclick=e=>{const button=e.target.closest('[data-view]');if(button){view=button.dataset.view;category='';limit=40;render();}};
$('theme').onchange=async()=>{const old=library.theme;library.theme=$('theme').value;applyTheme();try{await window.newsApp.theme(library.theme);}catch(e){library.theme=old;applyTheme();toast('Nie udało się zapisać motywu.');}};
document.addEventListener('keydown',e=>{if(e.ctrlKey&&e.key.toLowerCase()==='k'){e.preventDefault();$('search').focus();}if(e.ctrlKey&&e.key.toLowerCase()==='r'){e.preventDefault();refresh();}if(e.ctrlKey&&e.key.toLowerCase()==='p'){e.preventDefault();if(selected)document.querySelector('.actions button:last-child')?.click();}});
(async()=>{try{library=await window.newsApp.library();applyTheme();render();await refresh();setInterval(()=>refresh({automatic:true}),AUTO_REFRESH_MS);window.addEventListener('focus',()=>refresh({automatic:true}));}catch(e){$('connection').textContent='Nie można otworzyć biblioteki: '+e.message;$('connection').className='error';}})();
