// Shared by the static build, the browser, and the optional Sheets importer.
export function parseCSV(text) {
  const rows = []; let row = [], field = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); if (row.some(x => x.trim())) rows.push(row);
      row = []; field = '';
    } else field += c;
  }
  if (quoted) throw new Error('Unclosed CSV quote');
  row.push(field); if (row.some(x => x.trim())) rows.push(row);
  return rows;
}

export function isoDate(value) {
  const match = String(value).match(/^(\d{4})[年/\-](\d{1,2})[月/\-](\d{1,2})/);
  if (!match) throw new Error(`Unrecognized date: ${value}`);
  const [, y, m, d] = match;
  const date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  const stamp = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(stamp.getTime()) || stamp.toISOString().slice(0, 10) !== date) throw new Error('Invalid date');
  return date;
}

export function safeURL(value) {
  try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; }
  catch { return ''; }
}

export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const newestFirst = items => [...items].sort((a,b) => b.date.localeCompare(a.date));

function table(csv, required) {
  const [header, ...rows] = parseCSV(csv);
  if (!header || required.some(k => !header.includes(k))) throw new Error('Unexpected spreadsheet columns');
  return rows.map(row => key => String(row[header.indexOf(key)] ?? '').trim());
}

export function talksFromCSV(csv) {
  const rows = table(csv, ['タイトル', '著者一覧', '会議名', '発表日', '発表種別']);
  const items = rows.filter(get => get('タイトル')).map(get => ({
    title: get('タイトル'), authors: get('著者一覧'), venue: get('会議名'),
    scope: get('研究会の種類'), number: get('発表番号(あれば)'), kind: get('発表種別'),
    language: get('発表言語'), location: get('開催地'),
    date: isoDate(get('発表日') || get('会議初日')), url: safeURL(get('参考URL(あれば)'))
  }));
  if (!items.length) throw new Error('No presentations returned; retaining the saved data');
  return newestFirst(items);
}

export function publicationsFromCSV(csv) {
  const rows = table(csv, ['タイトル', '著者一覧', 'arXiv情報', '雑誌名・巻号・頁']);
  const items = rows.filter(get => get('タイトル')).map(get => {
    const arxiv = get('arXiv情報').match(/\b(\d{4}\.\d{4,5})\b/)?.[1] || '';
    const year = get('発行年').match(/\d{4}/)?.[0] || (arxiv ? `20${arxiv.slice(0,2)}` : '');
    if (!year) throw new Error('Publication has no year or arXiv identifier');
    const source = safeURL(get('参考URL(あれば)'));
    return {title: get('タイトル'), authors: get('著者一覧'), date: `${year}-01-01`,
      journal: get('雑誌名・巻号・頁'), arxiv, category: get('arXiv情報').match(/\[([^\]]+)\]/)?.[1] || '',
      doi: source.includes('doi.org/') && !source.includes('10.48550/arXiv') ? source.split('doi.org/')[1] : '', source};
  });
  if (!items.length) throw new Error('No publications returned');
  return newestFirst(items);
}

// Sheet entries take precedence; public papers absent from an older sheet remain visible.
export function mergePublications(saved, incoming) {
  const key = p => p.arxiv || p.title.trim().toLowerCase();
  const entries = new Map(saved.map(p => [key(p), p]));
  for (const p of incoming) {
    const old = entries.get(key(p));
    entries.set(key(p), {...old, ...p, date: old?.date?.startsWith(p.date.slice(0,4)) ? old.date : p.date});
  }
  return newestFirst([...entries.values()]);
}

function link(url, label) { return safeURL(url) ? `<a href="${escapeHTML(safeURL(url))}" rel="noopener noreferrer">${escapeHTML(label)} <span aria-hidden="true">↗</span></a>` : ''; }
function authorLine(authors) { return escapeHTML(authors).replace(/Ryosuke Suda|R\. Suda|須田亮介|須田 亮介/g, '<strong>$&</strong>'); }

export function publicationHTML(p, lang = 'ja') {
  const year = p.date.slice(0,4);
  return `<li class="record" data-record><div class="record-date">${year}</div><div class="record-body">
    <h3>${escapeHTML(p.title)}</h3><p class="authors">${authorLine(p.authors)}</p>
    ${p.journal ? `<p class="venue">${escapeHTML(p.journal)}</p>` : ''}
    <div class="record-links">${p.arxiv ? link(`https://arxiv.org/abs/${p.arxiv}`, `arXiv:${p.arxiv}${p.category ? ` [${p.category}]` : ''}`) : ''}${p.doi ? link(`https://doi.org/${p.doi}`, lang === 'ja' ? '掲載誌' : 'Journal') : ''}</div>
  </div></li>`;
}

export function talkHTML(p, lang = 'ja') {
  const kind = lang === 'en' ? ({'口頭発表':'Talk','ポスター発表':'Poster'}[p.kind] || p.kind) : p.kind;
  return `<li class="record" data-record data-kind="${escapeHTML(p.kind)}"><div class="record-date"><time datetime="${escapeHTML(p.date)}">${escapeHTML(p.date.replaceAll('-', '.'))}</time><span class="kind">${escapeHTML(kind)}</span></div>
    <div class="record-body"><h3>${escapeHTML(p.title)}</h3><p class="authors">${authorLine(p.authors)}</p>
    <p class="venue">${escapeHTML(p.venue)}</p><p class="location">${escapeHTML([p.location,p.number].filter(Boolean).join(' · '))}</p>
    <div class="record-links">${link(p.url, lang === 'ja' ? '発表・研究会の詳細' : 'Presentation / event')}</div></div></li>`;
}
