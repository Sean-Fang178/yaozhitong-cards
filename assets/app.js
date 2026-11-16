// Shared renderer for index.html and drug.html. Drug content lives in data/, never here.
const SECTIONS = [
  ['whatIsIt', '這是什麼藥'],
  ['purpose', '用來治療什麼'],
  ['howToTake', '怎麼吃'],
  ['sideEffects', '可能的副作用'],
  ['seekCare', '出現這些情況要就醫'],
];
const LISTS = [
  ['contraindications', '哪些人不能吃'],
  ['diet', '飲食與生活要注意'],
  ['population', '特殊族群'],
];
const NOT_IN_LEAFLET = '仿單沒有記載這一項。';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// ==重點== in data becomes a highlighted <mark>
const fmt = (s) => esc(s).replace(/==(.+?)==/g, '<mark>$1</mark>');
const paras = (s) => s.split(/\n+/).filter(Boolean).map((p) => `<p>${fmt(p)}</p>`).join('');

function sourceBlock(ids, leaflet) {
  if (!ids || !ids.length) return '';
  const body = ids.map((id) => `<div class="cid">仿單段落 ${esc(id)}</div><pre>${esc(leaflet[id] || '（原文缺漏）')}</pre>`).join('');
  return `<details class="src"><summary>對照仿單原文</summary>${body}</details>`;
}

function setupFontSize() {
  const root = document.documentElement;
  let size = 'm';
  try { size = localStorage.getItem('fontSize') || 'm'; } catch (e) {}
  const apply = (s) => {
    root.dataset.size = s;
    document.querySelectorAll('.sizes button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.size === s)));
    try { localStorage.setItem('fontSize', s); } catch (e) {}
  };
  document.querySelectorAll('.sizes button').forEach((b) => b.addEventListener('click', () => apply(b.dataset.size)));
  apply(size);
}

const tagsHtml = (d) => d.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('') + `<span class="tag">${esc(d.category)}</span>`;

async function renderIndex() {
  const list = await (await fetch('data/drugs.json')).json();
  const ul = document.getElementById('cards');
  const q = document.getElementById('q');
  const draw = () => {
    const k = q.value.trim().toLowerCase();
    const hit = list.filter((d) => !k || [d.shortName, d.nameZh, d.nameEn, ...d.tags].join(' ').toLowerCase().includes(k));
    ul.innerHTML = hit.length
      ? hit.map((d) => `<li><a class="card" href="drug.html?id=${encodeURIComponent(d.id)}">
          <b>${esc(d.nameZh)}</b> <span class="en">${esc(d.nameEn)}</span><br>
          ${tagsHtml(d)}<p>${esc(d.summary)}</p></a></li>`).join('')
      : '<li class="empty">找不到符合的藥品。</li>';
  };
  q.addEventListener('input', draw);
  draw();
}

async function renderDrug() {
  const id = new URLSearchParams(location.search).get('id');
  const main = document.getElementById('main');
  let d;
  try {
    const res = await fetch(`data/drugs/${encodeURIComponent(id)}.json`);
    if (!res.ok) throw new Error(res.status);
    d = await res.json();
  } catch (e) {
    main.innerHTML = '<h1>找不到這款藥</h1><p><a href="./">回到藥品列表</a></p>';
    return;
  }
  document.title = `${d.shortName}｜白話藥品卡`;
  const sec = SECTIONS.map(([k, label]) => {
    const s = d.sections[k];
    const body = s && s.text ? paras(s.text) + sourceBlock(s.sources, d.leaflet) : `<p class="empty">${NOT_IN_LEAFLET}</p>`;
    return `<section class="section"><h2>${label}</h2>${body}</section>`;
  }).join('');
  const lists = LISTS.map(([k, label]) => {
    const items = d.lists[k] || [];
    const body = items.length
      ? `<ul class="items">${items.map((it) => `<li>${fmt(it.text)}${sourceBlock(it.sources, d.leaflet)}</li>`).join('')}</ul>`
      : `<p class="empty">${NOT_IN_LEAFLET}</p>`;
    return `<section class="section"><h2>${label}</h2>${body}</section>`;
  }).join('');
  main.innerHTML = `
    <p><a href="./">← 所有藥品</a></p>
    <h1>${esc(d.nameZh)}</h1>
    <p class="sub">${esc(d.nameEn)}</p>
    ${tagsHtml(d)}
    <dl class="meta">
      <dt>許可證</dt><dd>${esc(d.licenseNo)}</dd>
      <dt>成分</dt><dd>${d.ingredients.map(esc).join('、')}</dd>
      <dt>劑型</dt><dd>${esc(d.dosageForm)}</dd>
      <dt>廠商</dt><dd>${esc(d.manufacturer)}</dd>
      <dt>仿單</dt><dd><a href="${esc(d.sourceUrl)}" target="_blank" rel="noopener">食藥署仿單 PDF</a></dd>
    </dl>
    ${sec}${lists}`;
}

setupFontSize();
if (document.body.dataset.page === 'index') renderIndex();
else renderDrug();
