/**
 * Builds static HTML for Resources / pathway guides from pathway/content/*.md
 * Each English .md pairs with a -KR.md Korean translation.
 * Run from repo root: node scripts/build-pathway.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const CONTENT_DIR = path.join(ROOT, 'pathway', 'content')
const OUT_BASE = path.join(ROOT, 'pathway')

/** Reading order & prev/next chain */
const META = [
  {
    slug: 'start-here',
    file: '00-start-here.md',
    prev: null,
    next: { slug: 'ma-hockey-landscape' }
  },
  {
    slug: 'ma-hockey-landscape',
    file: '01-ma-hockey-landscape-overview.md',
    prev: { slug: 'start-here' },
    next: { slug: 'tier-meaning-by-age' }
  },
  {
    slug: 'tier-meaning-by-age',
    file: '02-tier-meaning-by-age.md',
    prev: { slug: 'ma-hockey-landscape' },
    next: { slug: 'club-vs-prep' }
  },
  {
    slug: 'club-vs-prep',
    file: '03-club-vs-prep-when-transition.md',
    prev: { slug: 'tier-meaning-by-age' },
    next: { slug: 'rankings' }
  },
  {
    slug: 'rankings',
    file: '04-thinking-about-rankings.md',
    prev: { slug: 'club-vs-prep' },
    next: { slug: 'academic-endgame' }
  },
  {
    slug: 'academic-endgame',
    file: '05-academic-endgame.md',
    prev: { slug: 'rankings' },
    next: { slug: 'prep-school-selection' }
  },
  {
    slug: 'prep-school-selection',
    file: '06-prep-school-selection.md',
    prev: { slug: 'academic-endgame' },
    next: { slug: 'junior-hockey-decision' }
  },
  {
    slug: 'junior-hockey-decision',
    file: '07-junior-hockey-decision.md',
    prev: { slug: 'prep-school-selection' },
    next: null
  }
]

function krFilePath (enFile) {
  return enFile.replace(/\.md$/, '-KR.md')
}

function escapeHtml (s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inlineFormat (s) {
  const LINK_MARK = '\uE000'
  const links = []
  let t = String(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const i = links.length
    links.push(
      `<a href="${escapeHtml(url)}" class="text-northstar-700 underline hover:text-northstar-900">${escapeHtml(text)}</a>`
    )
    return `${LINK_MARK}${i}${LINK_MARK}`
  })
  t = escapeHtml(t)
  for (let i = links.length - 1; i >= 0; i--) {
    t = t.replace(`${LINK_MARK}${i}${LINK_MARK}`, links[i])
  }
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/\*(.+?)\*/g, '<em>$1</em>')
  return t
}

function extractTitle (md) {
  const m = md.match(/^#\s+(.+)$/m)
  return m ? m[1].trim().replace(/\s+/g, ' ') : 'Guide'
}

function mdToHtml (md) {
  const lines = md.split(/\r?\n/)
  let i = 0
  const parts = []

  if (lines[0]?.startsWith('# ')) {
    i = 1
    while (i < lines.length && !lines[i].trim()) i++
  }

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }

    if (line.startsWith('*') && line.endsWith('*')) {
      const inner = line.slice(1, -1)
      if (/^Next in the series/i.test(inner) || /^This concludes/i.test(inner)) {
        i++
        continue
      }
    }

    if (line === '---') {
      i++
      continue
    }

    if (line.startsWith('### ')) {
      parts.push(
        `<h3 class="text-xl font-semibold text-northstar-900 mt-10 mb-3">${inlineFormat(line.slice(4))}</h3>`
      )
      i++
      continue
    }

    if (line.startsWith('## ')) {
      parts.push(
        `<h2 class="text-2xl font-display text-northstar-900 tracking-wide mt-12 mb-4">${inlineFormat(line.slice(3))}</h2>`
      )
      i++
      continue
    }

    if (line.startsWith('# ')) {
      parts.push(
        `<h2 class="text-2xl font-display text-northstar-900 tracking-wide mt-12 mb-4">${inlineFormat(line.slice(2))}</h2>`
      )
      i++
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(
          `<li class="leading-relaxed pl-1">${inlineFormat(lines[i].replace(/^\d+\.\s+/, ''))}</li>`
        )
        i++
      }
      parts.push(
        `<ol class="list-decimal list-outside space-y-2 my-4 ml-6 text-gray-700">${items.join('')}</ol>`
      )
      continue
    }

    if (line.startsWith('- ')) {
      const items = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(`<li class="leading-relaxed pl-1">${inlineFormat(lines[i].slice(2))}</li>`)
        i++
      }
      parts.push(
        `<ul class="list-disc list-outside space-y-2 my-4 ml-6 text-gray-700">${items.join('')}</ul>`
      )
      continue
    }

    if (/^\*(?!\*).+\*$/.test(line)) {
      parts.push(
        `<p class="text-gray-600 italic leading-relaxed mb-4 border-l-4 border-northstar-300 pl-4">${inlineFormat(line.slice(1, -1))}</p>`
      )
      i++
      continue
    }

    const paraLines = [line]
    i++
    while (i < lines.length) {
      const L = lines[i]
      if (!L.trim()) break
      if (L.startsWith('#') || L.startsWith('- ') || /^\d+\.\s/.test(L) || L === '---') break
      if (L.startsWith('*') && L.endsWith('*')) break
      paraLines.push(L)
      i++
    }
    parts.push(`<p class="text-gray-700 leading-relaxed mb-4">${inlineFormat(paraLines.join(' '))}</p>`)
  }

  return parts.join('\n')
}

function headerHtml ({ activePath }) {
  const pathwayActive = activePath === 'pathway'
  const articleActive = activePath === 'article'
  return `<header class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
    <nav class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 md:h-20">
        <a href="/" class="font-display text-xl md:text-2xl tracking-wide text-northstar-800">NORTHSTAR EDUCATION GROUP</a>
        <div class="hidden md:flex items-center gap-6 lg:gap-8">
          <a href="/#services" class="text-gray-600 hover:text-northstar-600 font-medium transition">Services</a>
          <a href="/#about" class="text-gray-600 hover:text-northstar-600 font-medium transition">About</a>
          <a href="/pathway/" class="font-medium transition ${pathwayActive || articleActive ? 'text-northstar-700' : 'text-gray-600 hover:text-northstar-600'}">Resources</a>
          <a href="/#contact" class="text-gray-600 hover:text-northstar-600 font-medium transition">Contact</a>
        </div>
        <button type="button" class="md:hidden p-2 text-gray-600 hover:text-northstar-600" aria-label="Menu" id="menu-btn">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
      <div id="mobile-menu" class="hidden md:hidden pb-4 border-t border-gray-100">
        <a href="/#services" class="block py-2 text-gray-600 hover:text-northstar-600">Services</a>
        <a href="/#about" class="block py-2 text-gray-600 hover:text-northstar-600">About</a>
        <a href="/pathway/" class="block py-2 font-medium ${pathwayActive || articleActive ? 'text-northstar-700' : 'text-gray-600 hover:text-northstar-600'}">Resources</a>
        <a href="/#contact" class="block py-2 text-gray-600 hover:text-northstar-600">Contact</a>
      </div>
    </nav>
  </header>`
}

function footerHtml () {
  return `<footer class="bg-northstar-950 text-gray-400 py-10 mt-auto">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <a href="/" class="font-display text-lg md:text-xl text-white hover:text-gray-200 transition">NORTHSTAR EDUCATION GROUP</a>
        <div class="flex gap-8">
          <a href="/pathway/" class="hover:text-white transition">Resources</a>
          <a href="/#services" class="hover:text-white transition">Services</a>
          <a href="/#contact" class="hover:text-white transition">Contact</a>
        </div>
      </div>
      <p class="mt-6 text-center md:text-left text-sm">© Northstar Education Group. All rights reserved.</p>
    </div>
  </footer>`
}

function articleScripts () {
  return `<script>
(function () {
  var KEY = 'northstar-pathway-article-lang';
  function paintButtons(lang) {
    document.querySelectorAll('.article-lang-btn').forEach(function (btn) {
      var active = btn.getAttribute('data-article-lang') === lang;
      btn.classList.toggle('bg-northstar-600', active);
      btn.classList.toggle('text-white', active);
      btn.classList.toggle('bg-gray-50', !active);
      btn.classList.toggle('text-gray-600', !active);
    });
  }
  function show(lang) {
    lang = lang === 'ko' ? 'ko' : 'en';
    document.body.classList.toggle('pathway-ko', lang === 'ko');
    paintButtons(lang);
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }
  document.querySelectorAll('[data-article-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () { show(btn.getAttribute('data-article-lang')); });
  });
  var stored = 'en';
  try {
    stored = localStorage.getItem(KEY);
    if (!stored) stored = localStorage.getItem('northstar-lang');
    if (!stored) stored = 'en';
  } catch (e) {}
  show(stored === 'ko' ? 'ko' : 'en');

  var mb = document.getElementById('menu-btn');
  var mm = document.getElementById('mobile-menu');
  if (mb && mm) mb.addEventListener('click', function () { mm.classList.toggle('hidden'); });
})();
</script>`
}

function resolveNav (ref) {
  if (!ref) return null
  const target = META.find(m => m.slug === ref.slug)
  if (!target) return null
  const md = fs.readFileSync(path.join(CONTENT_DIR, target.file), 'utf8')
  return { slug: ref.slug, title: extractTitle(md) }
}

function buildArticlePage (titleEn, titleKo, bodyEn, bodyKo, prev, next) {
  const prevLink = prev
    ? `<a href="/pathway/${prev.slug}/" class="text-northstar-700 font-medium hover:underline">← Previous: ${escapeHtml(prev.title)}</a>`
    : ''
  const nextLink = next
    ? `<a href="/pathway/${next.slug}/" class="inline-flex font-semibold text-northstar-700 hover:text-northstar-900 hover:underline">Next: ${escapeHtml(next.title)} →</a>`
    : ''

  const navJustify =
    prev && next ? 'sm:justify-between' : next ? 'sm:justify-end' : 'sm:justify-start'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(titleEn)} | Resources | Northstar Education Group</title>
  <meta name="description" content="${escapeHtml(titleEn)} — Honest guides for Korean families navigating Massachusetts hockey and prep pathways." />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            northstar: {
              50: '#eef9ff', 100: '#d9f1ff', 200: '#bce7ff', 300: '#8ed9ff',
              400: '#59c2ff', 500: '#33a6ff', 600: '#1a87f5', 700: '#136ee1',
              800: '#1658b6', 900: '#184b8f', 950: '#142f57',
            },
            ice: '#f0f9ff',
          },
          fontFamily: {
            sans: ['Outfit', 'system-ui', 'sans-serif'],
            display: ['Bebas Neue', 'Impact', 'sans-serif'],
          },
        },
      },
    };
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    body.pathway-ko .pathway-article-en { display: none !important; }
    body.pathway-ko .pathway-ko-panel { display: block !important; }
    .pathway-ko-panel { display: none; }
    body.pathway-ko .pathway-talk-en { display: none !important; }
    body.pathway-ko .pathway-talk-ko { display: block !important; }
    .pathway-talk-ko { display: none; }
  </style>
</head>
<body class="font-sans text-gray-800 antialiased bg-white flex flex-col min-h-screen">
  ${headerHtml({ activePath: 'article' })}
  <main class="flex-grow max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 w-full">
    <nav class="flex flex-wrap items-center gap-3 justify-between mb-8 text-sm">
      <a href="/pathway/" class="text-northstar-700 font-medium hover:underline">← Resources hub</a>
      <div class="flex rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <button type="button" data-article-lang="en" class="article-lang-btn px-4 py-2 text-sm font-semibold transition-colors border-r border-gray-200 bg-northstar-600 text-white">EN</button>
        <button type="button" data-article-lang="ko" class="article-lang-btn px-4 py-2 text-sm font-semibold transition-colors bg-gray-50 text-gray-600">한국어</button>
      </div>
    </nav>

    <article class="pathway-article-en">
      <h1 class="font-display text-3xl sm:text-4xl md:text-5xl text-northstar-900 tracking-wide leading-tight mb-8">${escapeHtml(titleEn)}</h1>
      <div class="article-body">
        ${bodyEn}
      </div>
    </article>

    <div class="pathway-ko-panel">
      <article>
        <h1 class="font-display text-3xl sm:text-4xl md:text-5xl text-northstar-900 tracking-wide leading-tight mb-8">${escapeHtml(titleKo)}</h1>
        <div class="article-body">
          ${bodyKo}
        </div>
      </article>
    </div>

    <nav aria-label="Article navigation" class="flex flex-col sm:flex-row sm:items-center gap-4 pt-10 mt-10 border-t border-gray-200 ${navJustify}">
      ${prevLink}
      ${nextLink}
    </nav>

    <div class="mt-12 rounded-2xl border border-gray-200 bg-ice p-6 md:p-8 pathway-talk-en">
      <h2 class="font-display text-xl text-northstar-900 tracking-wide mb-3">Talk to us</h2>
      <p class="text-gray-700 leading-relaxed mb-4">
        Reading these guides is the start. The decisions are different for every family.
        If you'd like to discuss your child's specific situation,
        <a href="mailto:kenneth@northstareducationgroup.com" class="text-northstar-700 font-semibold hover:underline">reach out to us</a>.
      </p>
      <p class="text-sm text-gray-600 mb-4">We'll respond honestly — no pressure and no generic sales pitch.</p>
      <a href="/pathway/" class="inline-flex text-sm font-semibold text-northstar-700 hover:underline">← Resources hub</a>
    </div>
    <div class="mt-12 rounded-2xl border border-gray-200 bg-ice p-6 md:p-8 pathway-talk-ko">
      <h2 class="font-display text-xl text-northstar-900 tracking-wide mb-3">문의하기</h2>
      <p class="text-gray-700 leading-relaxed mb-4">
        가이드를 읽는 것은 시작일 뿐입니다. 가족마다 결정은 다릅니다.
        자녀 상황에 대해 상담하고 싶으시면
        <a href="mailto:kenneth@northstareducationgroup.com" class="text-northstar-700 font-semibold hover:underline">이메일로 연락</a>해 주세요.
      </p>
      <p class="text-sm text-gray-600 mb-4">부담 없이 솔직하게 답변드리며, 일반적인 영업 메시지는 보내지 않습니다.</p>
      <a href="/pathway/" class="inline-flex text-sm font-semibold text-northstar-700 hover:underline">← 리소스 허브로</a>
    </div>
  </main>
  ${footerHtml()}
  ${articleScripts()}
</body>
</html>`
}

for (const art of META) {
  const fp = path.join(CONTENT_DIR, art.file)
  const krFp = path.join(CONTENT_DIR, krFilePath(art.file))
  if (!fs.existsSync(fp)) {
    console.error('Missing:', fp)
    process.exit(1)
  }
  if (!fs.existsSync(krFp)) {
    console.error('Missing Korean:', krFp)
    process.exit(1)
  }
  const mdEn = fs.readFileSync(fp, 'utf8')
  const mdKo = fs.readFileSync(krFp, 'utf8')
  const titleEn = extractTitle(mdEn)
  const titleKo = extractTitle(mdKo)
  const bodyEn = mdToHtml(mdEn)
  const bodyKo = mdToHtml(mdKo)
  const prev = resolveNav(art.prev)
  const next = resolveNav(art.next)
  const html = buildArticlePage(titleEn, titleKo, bodyEn, bodyKo, prev, next)
  const dir = path.join(OUT_BASE, art.slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8')
  console.log('Wrote', art.slug)
}

console.log('Done.')
