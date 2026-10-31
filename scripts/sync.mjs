import {readFile,writeFile,rename} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {talksFromCSV,publicationsFromCSV,mergePublications} from '../assets/records.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)),'..');
const configPath = resolve(root,'data/sources.json');
const sources = JSON.parse(await readFile(configPath,'utf8'));
const args = process.argv.slice(2);
const option = key => args.includes(key) ? args[args.indexOf(key)+1] : '';
const publicationFile = option('--publications-csv');
const publicationUrl = option('--publications-url') || sources.publicationsCsvUrl;
async function getCSV(url) {
  const response = await fetch(url,{signal:AbortSignal.timeout(20000)});
  if (!response.ok) throw new Error(`Failed to read sheet: HTTP ${response.status}`);
  return response.text();
}
async function atomicJSON(path,value) {
  await writeFile(`${path}.tmp`,JSON.stringify(value,null,2)+'\n'); await rename(`${path}.tmp`,path);
}
const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const updates = [];
if (!publicationFile && sources.talksCsvUrl) {
  const items = talksFromCSV(await getCSV(sources.talksCsvUrl));
  updates.push(['talks',{updated:today,items}]); sources.talksUpdated = today;
}
if (publicationFile || publicationUrl) {
  const csv = publicationFile ? await readFile(resolve(publicationFile),'utf8') : await getCSV(publicationUrl);
  const saved = JSON.parse(await readFile(resolve(root,'data/publications.json'),'utf8'));
  const items = mergePublications(saved.items,publicationsFromCSV(csv));
  updates.push(['publications',{updated:today,items}]); sources.publicationsUpdated = today;
  if (option('--publications-url')) sources.publicationsCsvUrl = publicationUrl;
}
// Validation above completes before any saved data is replaced.
for (const [name,value] of updates) { await atomicJSON(resolve(root,`data/${name}.json`),value); console.log(`${name}: ${value.items.length} records`); }
await atomicJSON(configPath,sources);
