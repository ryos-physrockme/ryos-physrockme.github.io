import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {escapeHTML as e,isoDate,newestFirst,publicationHTML,talkHTML} from '../assets/records.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = async name => JSON.parse(await readFile(resolve(root, `data/${name}.json`),'utf8'));
const papers = await read('publications');
const talks = await read('talks');
const sources = await read('sources');
papers.items = newestFirst(papers.items);
talks.items = newestFirst(talks.items.map(t => ({...t,date:isoDate(t.date)})));

const email = 'r.suda.813@ms.saitama-u.ac.jp';
const profiles = [
  ['INSPIRE-HEP','https://inspirehep.net/authors/2921867'],
  ['ORCID','https://orcid.org/0009-0003-1021-8281'],
  ['GitHub','https://github.com/ryos-physrockme'],
  ['X','https://x.com/ryos_physrockme']
];
const profileLinks = profiles.map(([name,url]) => `<a href="${url}" rel="noopener noreferrer">${name}</a>`).join('\n');

const content = {
  ja: {
    home:'自己紹介', achievements:'論文・発表', contact:'連絡先', skip:'本文へ',
    name:'須田 亮介', otherName:'Ryosuke Suda',
    intro:'素粒子論と場の理論を中心に研究しています。理論の数理的な構造から、模型構築や現象論、実験・観測との関係まで関心があります。',
    research:'研究関心',
    topics:[
      {
        title:'場の理論・数理物理',
        paragraphs:[
          '対称性や幾何学、可積分性、理論の変形、非線形現象に関心があります。古典場の理論と場の量子論の双方に興味があり、異なる理論や物理系の関係を調べたいと考えています。',
          '数学、物性物理、情報科学、工学で使われる概念や手法を素粒子論に取り入れること、また素粒子論の視点や手法を他分野へ応用することにも興味があります。分野ごとに異なる言葉を対応づけ、そこで使われている考え方や道具を行き来させながら、物理を理解したいと考えています。'
        ]
      },
      {
        title:'AI for theoretical physics',
        paragraphs:[
          '機械学習や大規模言語モデルを用いた理論物理の研究手法を探っています。理論や解の探索に加え、記号計算、導出の検証、研究を支援するエージェントなどにも関心があります。'
        ]
      }
    ],
    selected:'最近の論文', all:'論文・発表の一覧', papers:'論文・プレプリント', talks:'学会・研究会発表',
    achievementsIntro:'論文・プレプリントと、学会・研究会での発表を掲載しています。',
    search:'キーワード', placeholder:'題目・共著者・研究会名', type:'発表種別', allType:'すべて',
    oral:'口頭発表', poster:'ポスター発表', year:'年', allYear:'すべての年',
    saved:`発表一覧：${talks.updated}取得の記録`, updated:'更新：2026年10月31日'
  },
  en: {
    home:'About', achievements:'Publications & talks', contact:'Contact', skip:'Skip to content',
    name:'Ryosuke Suda', otherName:'須田 亮介',
    intro:'My research centers on particle physics and field theory. My interests range from the mathematical structure of theories to model building, particle phenomenology, and connections with experiments and observations.',
    research:'Research interests',
    topics:[
      {
        title:'Field theory and mathematical physics',
        paragraphs:[
          'I am interested in symmetry, geometry, integrability, deformations of theories, and nonlinear phenomena. My interests include both classical and quantum field theory, as well as relations between different theories and physical systems.',
          'I am also interested in bringing concepts and methods from mathematics, condensed matter physics, computer science, and engineering into particle physics, and in applying ideas from particle physics to other fields. I enjoy finding connections between the languages of different disciplines and using their ideas and tools to understand physics.'
        ]
      },
      {
        title:'AI for theoretical physics',
        paragraphs:[
          'I explore research methods for theoretical physics using machine learning and large language models. My interests include searching for theories and solutions, symbolic computation, verification of derivations, and agents that assist with research.'
        ]
      }
    ],
    selected:'Recent papers', all:'All publications and talks', papers:'Publications & preprints',
    talks:'Conference & workshop presentations',
    achievementsIntro:'Publications, preprints, and presentations at conferences and workshops. Presentation titles are shown in their original language.',
    search:'Search', placeholder:'Title, author, or event', type:'Presentation type', allType:'All types',
    oral:'Talk', poster:'Poster', year:'Year', allYear:'All years',
    saved:`Presentations: saved on ${talks.updated}`, updated:'Updated: 31 October 2026'
  }
};

for (const lang of ['ja','en']) for (const page of ['home','achievements']) {
  const t = content[lang], isHome = page === 'home';
  const route = `${lang==='en'?'en/':''}${isHome?'':'achievements/'}index.html`;
  const depth = route.split('/').length - 1;
  const base = '../'.repeat(depth) || './';
  const home = base + (lang==='en'?'en/':'') + 'index.html';
  const achievements = base + (lang==='en'?'en/':'') + 'achievements/index.html';
  const other = base + (lang==='ja'?'en/':'') + (isHome?'':'achievements/') + 'index.html';
  const contact = `
    <div id="contact" class="contact" aria-label="${t.contact}">
      <p>Email: <a class="email" href="mailto:${email}">${email}</a></p>
      <div class="profile-links">${profileLinks}</div>
    </div>`;
  const research = `
    <section class="section" id="research" aria-labelledby="research-title">
      <h2 id="research-title">${t.research}</h2>
      ${t.topics.map(topic => `
        <section class="research-topic">
          <h3>${topic.title}</h3>
          ${topic.paragraphs.map(p => `<p>${e(p)}</p>`).join('\n')}
        </section>`).join('\n')}
    </section>`;
  const introduction = `
    <div class="introduction">
      <h1>${t.name} <span class="other-name" lang="${lang==='ja'?'en':'ja'}">${t.otherName}</span></h1>
      ${contact}
      <p class="intro-text">${e(t.intro)}</p>
    </div>`;
  const homeBody = `${introduction}${research}
    <section class="section" aria-labelledby="recent-title">
      <h2 id="recent-title">${t.selected}</h2>
      <ol class="records">${papers.items.slice(0,3).map(p => publicationHTML(p,lang)).join('\n')}</ol>
      <p class="all-records"><a href="${achievements}">${t.all}</a></p>
    </section>`;
  const achievementsBody = `
    <div class="page-heading">
      <h1>${t.achievements}</h1>
      <p>${t.achievementsIntro}</p>
      <nav class="jump-links" aria-label="${lang==='ja'?'ページ内移動':'On this page'}">
        <a href="#publications">${t.papers}</a>
        <a href="#presentations">${lang==='ja'?'発表':'Presentations'}</a>
      </nav>
    </div>
    <section class="section" id="publications" aria-labelledby="publications-title">
      <h2 id="publications-title">${t.papers}</h2>
      <ol id="publication-list" class="records">${papers.items.map(p => publicationHTML(p,lang)).join('\n')}</ol>
    </section>
    <section class="section" id="presentations" aria-labelledby="presentations-title">
      <h2 id="presentations-title">${t.talks}</h2>
      <div class="filters" id="filters" hidden>
        <label class="search-label" for="search">${t.search}<input id="search" type="search" placeholder="${t.placeholder}"></label>
        <label for="type">${t.type}<select id="type">
          <option value="">${t.allType}</option><option value="口頭発表">${t.oral}</option><option value="ポスター発表">${t.poster}</option>
        </select></label>
        <label for="year">${t.year}<select id="year"><option value="">${t.allYear}</option></select></label>
      </div>
      <p id="filter-result" class="filter-result" role="status" hidden></p>
      <ol id="talk-list" class="records">${talks.items.map(p => talkHTML(p,lang)).join('\n')}</ol>
      <p class="empty" id="empty" hidden>${lang==='ja'?'該当する発表はありません。':'No matching presentations.'}</p>
      <p id="sync-status" class="status" role="status">${t.saved}</p>
      <noscript><p class="status">${lang==='ja'?'保存済みの発表一覧を表示しています。':'Showing the saved presentation list.'}</p></noscript>
    </section>`;
  const title = `${isHome?'':t.achievements+' | '}須田亮介 / Ryosuke Suda`;
  const html = `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(title)}</title>
  <meta name="description" content="${e(t.intro)}">
  <meta name="theme-color" content="#ffffff">
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(t.intro)}">
  <meta property="og:type" content="website">
  <link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${base}assets/site.css">
</head>
<body>
  <a class="skip" href="#main">${t.skip}</a>
  <div class="wrap">
    <header class="site-header">
      ${!isHome?`<p class="site-name"><a href="${home}">Ryosuke Suda</a></p>`:''}
      <nav class="nav" aria-label="${lang==='ja'?'メインナビゲーション':'Main navigation'}">
        <a href="${home}"${isHome?' aria-current="page"':''}>${t.home}</a>
        <a href="${achievements}"${!isHome?' aria-current="page"':''}>${t.achievements}</a>
        <a class="contact-nav" href="${isHome?'#contact':home+'#contact'}">${t.contact}</a>
        <a class="language" href="${other}" lang="${lang==='ja'?'en':'ja'}" hreflang="${lang==='ja'?'en':'ja'}">${lang==='ja'?'English':'日本語'}</a>
      </nav>
    </header>
    <main id="main">${isHome?homeBody:achievementsBody}</main>
    <footer class="site-footer"><p>${t.updated}</p></footer>
  </div>
  ${!isHome?`<script id="saved-data" type="application/json">${JSON.stringify({talks:talks.items,papers:papers.items,sources}).replaceAll('<','\\u003c')}</script>
  <script type="module" src="${base}assets/achievements.mjs"></script>`:''}
</body>
</html>\n`;
  await mkdir(dirname(resolve(root,route)),{recursive:true});
  await writeFile(resolve(root,route),html.replace(/[ \t]+$/gm,''));
}
console.log(`Built 4 pages: ${papers.items.length} publications, ${talks.items.length} presentations.`);
