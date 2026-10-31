import {escapeHTML as e} from '../assets/records.mjs';

export function cardHTML(card, lang, version) {
  const ja = lang === 'ja';
  const base = ja ? '../' : '../../';
  const home = `${base}${ja ? '' : 'en/'}index.html${version}`;
  const other = `${base}${ja ? 'en/' : ''}card/index.html${version}`;
  const primary = ja ? card.nameJa : card.nameEn;
  const secondary = ja ? card.nameEn : card.nameJa;
  const qr = (kind, label) => `<a class="qr-button" data-qr="${kind}" href="${base}assets/card-${kind}.svg${version}" aria-label="${ja ? `${label}のQRコードを拡大` : `Enlarge ${label} QR code`}"><span>${label}</span><img src="${base}assets/card-${kind}.svg${version}" width="370" height="370" alt="${ja ? `${label}用QRコード` : `${label} QR code`}"></a>`;
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <title>${e(primary)} | ${ja ? '名刺' : 'Business card'}</title>
  <meta name="description" content="${e(card.nameJa)} / ${e(card.nameEn)} — ${e(card.email)}">
  <link rel="icon" href="${base}assets/favicon.svg${version}" type="image/svg+xml">
  <link rel="stylesheet" href="${base}assets/card.css${version}">
</head>
<body>
  <div class="card-wrap">
    <nav class="card-nav" aria-label="${ja ? 'ページ移動' : 'Page navigation'}">
      <a href="${home}">${ja ? '← 自己紹介' : '← About'}</a>
      <a href="${other}" lang="${ja ? 'en' : 'ja'}">${ja ? 'English' : '日本語'}</a>
    </nav>
    <main>
      <article class="business-card" aria-labelledby="card-name">
        <h1 id="card-name">${e(primary)}</h1>
        <p class="name-secondary" lang="${ja ? 'en' : 'ja'}">${e(secondary)}</p>
        <div class="affiliation" lang="ja">
          <p>${e(card.affiliationJa[0])}</p>
          <p>${e(card.affiliationJa[1])} · ${e(card.affiliationJa[2])}</p>
        </div>
        <div class="affiliation-en" lang="en">
          ${card.affiliationEn.map(line => `<p>${e(line)}</p>`).join('\n          ')}
        </div>
        <div class="card-contact">
          <a href="mailto:${e(card.email)}">${e(card.email)}</a>
          <a href="${e(card.website)}">${e(card.website.replace(/^https:\/\//, '').replace(/\/$/, ''))}</a>
        </div>
        <div class="qr-pair">${qr('website', 'Website')}${qr('email', 'Email')}</div>
        <p class="qr-hint">${ja ? 'QRコードをタップして拡大' : 'Tap a QR code to enlarge'}</p>
      </article>
      <div class="card-actions"><a class="save-image" href="${base}assets/ryosuke-suda-card.png${version}" download="ryosuke-suda-card.png">${ja ? '画像を保存' : 'Save image'}</a></div>
    </main>
  </div>
  <dialog id="qr-dialog" aria-labelledby="qr-title">
    <button class="close-dialog" type="button">${ja ? '閉じる' : 'Close'}</button>
    <h2 id="qr-title"></h2>
    <img id="qr-large" width="370" height="370" alt="">
    <a id="qr-destination"></a>
  </dialog>
  <script type="module" src="${base}assets/card.mjs${version}"></script>
</body>
</html>\n`;
}
