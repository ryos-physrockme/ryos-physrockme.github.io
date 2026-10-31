import {talksFromCSV,publicationsFromCSV,mergePublications,talkHTML,publicationHTML} from './records.mjs';
const {talks: savedTalks, papers, sources} = JSON.parse(document.getElementById('saved-data').textContent);
const lang = document.documentElement.lang, isJa = lang === 'ja';
let talks = savedTalks;
const list = document.getElementById('talk-list');
const search = document.getElementById('search'), type = document.getElementById('type'), year = document.getElementById('year');
const result = document.getElementById('filter-result');
function populateYears() {
  const selected = year.value;
  year.replaceChildren(new Option(isJa ? 'すべての年' : 'All years', ''));
  for (const y of [...new Set(talks.map(t=>t.date.slice(0,4)))].sort().reverse()) year.add(new Option(y,y));
  if ([...year.options].some(o=>o.value===selected)) year.value = selected;
}
function render() {
  const query = search.value.trim().toLocaleLowerCase();
  const shown = talks.filter(t => (!type.value || t.kind === type.value) && (!year.value || t.date.startsWith(year.value)) &&
    (!query || [t.title,t.authors,t.venue,t.location].join(' ').toLocaleLowerCase().includes(query)));
  // The renderer escapes all external text and permits only HTTP(S) links.
  list.innerHTML = shown.map(t=>talkHTML(t,lang)).join('');
  result.textContent = isJa ? `${talks.length}件中 ${shown.length}件を表示` : `${shown.length} of ${talks.length} presentations`;
  document.getElementById('empty').hidden = shown.length !== 0;
}
populateYears(); render(); document.getElementById('filters').hidden = false; result.hidden = false;
search.addEventListener('input',render); type.addEventListener('change',render); year.addEventListener('change',render);
async function fetchCSV(url) {
  const response = await fetch(url,{signal:AbortSignal.timeout(10000),credentials:'omit',cache:'no-store'});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}
if (sources.talksCsvUrl) {
  fetchCSV(sources.talksCsvUrl).then(csv=>{
    talks = talksFromCSV(csv); populateYears(); render();
  }).catch(()=>{
    // Keep the saved list when updates are unavailable.
  });
}
if (sources.publicationsCsvUrl) {
  fetchCSV(sources.publicationsCsvUrl).then(csv=>{
    document.getElementById('publication-list').innerHTML = mergePublications(papers,publicationsFromCSV(csv)).map(p=>publicationHTML(p,lang)).join('');
  }).catch(()=>{});
}
