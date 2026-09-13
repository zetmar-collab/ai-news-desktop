const clean = (value, max = 100000) => typeof value === 'string' ? value.slice(0, max) : '';
function normalize(payload) {
  if (!payload || !Array.isArray(payload.news)) throw new Error('Nieprawidłowy format danych serwisu.');
  const seen = new Set();
  const news = payload.news.slice(0, 10000).filter(n => n && ['number','string'].includes(typeof n.id) && typeof n.title === 'string').map(n => ({
    id: String(n.id).slice(0,100), title: clean(n.title,1000), category: clean(n.category,80) || 'inne',
    date: /^\d{4}-\d{2}-\d{2}$/.test(n.date) ? n.date : '', source: clean(n.source,1000),
    excerpt: clean(n.excerpt), full: clean(n.full) || clean(n.excerpt), hot: n.hot === true,
    tags: Array.isArray(n.tags) ? n.tags.filter(t=>typeof t==='string').slice(0,30).map(t=>clean(t,100)) : []
  })).filter(n => { if(seen.has(n.id)) return false; seen.add(n.id); return true; });
  if (!news.length) throw new Error('Serwis nie zwrócił wiadomości.');
  return news;
}
function postText(n) { return `${n.title}\n${n.date} • ${n.source}\n\n${n.full}\n\nAI Evolution News\nhttps://aievolutionnews.live/#news-${encodeURIComponent(n.id)}`; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function printHtml(n) { return `<!doctype html><html lang="pl"><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>@page{margin:20mm}body{font:12pt/1.6 'Segoe UI',sans-serif;color:#111}h1{font-size:24pt;line-height:1.2}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere}footer{font-size:9pt;border-top:1px solid #ccc;margin-top:24px}</style><h1>${escapeHtml(n.title)}</h1><p>${escapeHtml(n.date)} · ${escapeHtml(n.source)}</p><pre>${escapeHtml(n.full)}</pre><footer>AI Evolution News • https://aievolutionnews.live/#news-${encodeURIComponent(n.id)}</footer></html>`; }
module.exports = {normalize,postText,printHtml};
