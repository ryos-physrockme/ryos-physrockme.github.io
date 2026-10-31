import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCSV,talksFromCSV,isoDate,safeURL,publicationHTML,talkHTML,publicationsFromCSV,mergePublications} from '../assets/records.mjs';
test('CSV supports BOM, commas, Japanese, quoted newlines, escaped quotes and CRLF',()=>{
  assert.deepEqual(parseCSV('\uFEFFa,b\r\n"日本語, x","line\n""two"""\r\n'),[['a','b'],['日本語, x','line\n"two"']]);
  assert.throws(()=>parseCSV('"unfinished'));
});
test('invalid, empty or changed spreadsheet responses cannot erase saved records',()=>{
  const header='タイトル,著者一覧,会議名,発表日,発表種別,参考URL(あれば)\n';
  const [record]=talksFromCSV(header+'Test,R. Suda,Meeting,2026年8月7日,口頭発表,https://example.org');
  assert.equal(record.date,'2026-08-07'); assert.equal(record.kind,'口頭発表');
  assert.throws(()=>talksFromCSV('<html>Sign in</html>')); assert.throws(()=>talksFromCSV(header));
  assert.throws(()=>isoDate('2026/02/30')); assert.equal(isoDate('2026/3/2'),'2026-03-02');
});
test('external spreadsheet text and unsafe URLs cannot execute in rendered records',()=>{
  const p={title:'<img src=x onerror=alert(1)>',authors:'<script>R. Suda</script>',date:'2026-01-01',kind:'" onclick="bad',venue:'& test',url:'javascript:alert(1)'};
  const html=talkHTML(p);
  assert.ok(!html.includes('<img')); assert.ok(!html.includes('<script>')); assert.ok(!html.includes('href="javascript:'));
  assert.ok(html.includes('&lt;img')); assert.equal(safeURL('data:text/html,x'),'');
  assert.ok(!publicationHTML({...p,arxiv:'" onmouseover="bad'}).includes(' onmouseover="bad'));
});
test('private form CSV imports preserve public papers missing from the sheet',()=>{
  const csv='タイトル,著者一覧,arXiv情報,雑誌名・巻号・頁,発行年,参考URL(あれば)\nPaper,R. Suda,2412.19468 [hep-th],,,https://doi.org/10.48550/arXiv.2412.19468';
  const p=publicationsFromCSV(csv)[0]; assert.equal(p.date,'2024-01-01'); assert.equal(p.doi,'');
  const merged=mergePublications([{...p,date:'2024-12-27'},{...p,arxiv:'2608.05146',date:'2026-08-05'}],[p]);
  assert.equal(merged.length,2); assert.equal(merged[1].date,'2024-12-27');
});
