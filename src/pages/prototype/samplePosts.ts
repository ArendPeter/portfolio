// PROTOTYPE — throwaway sample data for the Post page / Blog Index prototype (issue #54).
// `html` mimics what the build-time remark/rehype + Shiki pipeline would emit.
// Metadata fields here are provisional — decided in "What are a Post's metadata and URL identity?" (#53).

export interface SamplePost {
  slug: string
  title: string
  date: string
  description: string
  readingMinutes: number
  cover?: string
  html: string
}

const tok = (color: string, text: string) => `<span style="color:${color}">${text}</span>`
const kw = (t: string) => tok('#F97583', t)
const fn = (t: string) => tok('#B392F0', t)
const str = (t: string) => tok('#9ECBFF', t)
const cm = (t: string) => tok('#6A737D', t)
const num = (t: string) => tok('#79B8FF', t)

const codeBlock = `<pre class="shiki" style="background-color:#24292e;color:#e1e4e8"><code>${[
  `${cm('// tally a STAR ballot: score phase, then automatic runoff')}`,
  `${kw('import')} { runoff } ${kw('from')} ${str("'./runoff'")}`,
  `${kw('export function')} ${fn('tallyStar')}(ballots: Ballot[], candidates: ${kw('string')}[]) {`,
  `  ${kw('const')} totals = ${kw('new')} ${fn('Map')}(candidates.${fn('map')}((c) ${kw('=>')} [c, ${num('0')}]))`,
  `  ${kw('for')} (${kw('const')} b ${kw('of')} ballots) {`,
  `    ${kw('for')} (${kw('const')} [c, score] ${kw('of')} Object.${fn('entries')}(b)) totals.${fn('set')}(c, totals.${fn('get')}(c)! + score)`,
  `  }`,
  `  ${kw('const')} [a, b] = [...totals].${fn('sort')}((x, y) ${kw('=>')} y[${num('1')}] - x[${num('1')}])`,
  `  ${kw('return')} ${fn('runoff')}(ballots, a[${num('0')}], b[${num('0')}]) ${cm('// pairwise preference decides')}`,
  `}`,
].join('\n')}</code></pre>`

const longHtml = `
<p>A year ago I thought the hard part of building an election platform would be the math. It wasn't. The tally code is maybe two hundred lines, and most of it is the kind of thing you write once and never touch. The hard part was everything around it: explaining results to people who'd never seen a <strong>STAR</strong> ballot, and earning enough trust that they'd run a real election on it.</p>
<p>This post is about the second part, with a detour through the first, because the <a href="#">tally code</a> turned out to be the best explanation tool I had.</p>
<h2 id="the-tally">The tally is the easy part</h2>
<p>Here's the core of it. Score every candidate, take the top two, and let the voters' head-to-head preferences decide between them:</p>
${codeBlock}
<p>Inline code like <code>tallyStar()</code> should read clearly mid-sentence without shouting.</p>
<figure><img src="/bettervoting-screenshot.png" alt="BetterVoting results page" /><figcaption>The results page, after three rounds of "people still don't get it."</figcaption></figure>
<h2 id="explaining-results">Explaining results is the hard part</h2>
<p>The first results page showed the totals and the winner. People read the totals, saw that the candidate with the most points won, and stopped. Which is fine — until the runoff flips it.</p>
<blockquote><p>"Wait, why did the second-place candidate win?"</p></blockquote>
<div class="callout" data-callout="note"><div class="callout-title">Note</div><div class="callout-content"><p>This is an Obsidian-style callout (<code>&gt; [!note]</code>) rendered by <code>rehype-callouts</code>. Whether callouts survive to the site is decided in the Obsidian ticket.</p></div></div>
<p>What helped, in order of how much it helped:</p>
<ol>
<li>Showing the runoff as its own step, with its own sentence of explanation.</li>
<li>Animating the transition from scores to the head-to-head.</li>
<li>Linking every number back to the ballots that produced it.</li>
</ol>
<h3 id="what-didnt">What didn't help</h3>
<ul>
<li>More text.</li>
<li>A FAQ nobody opened.</li>
</ul>
<h2 id="trust">Trust is earned in boring ways</h2>
<p>The Python Steering Council election didn't happen because the UI was pretty. It happened because the source was public, the tally was reproducible, and someone could <em>check our work</em>. That's the whole post, really: make the work checkable.</p>
`

export const samplePosts: SamplePost[] = [
  {
    slug: 'the-tally-is-the-easy-part',
    title: 'The tally is the easy part',
    date: '2026-10-02',
    description:
      'What building an election platform taught me about explaining results and earning trust.',
    readingMinutes: 6,
    cover: '/bettervoting-screenshot.png',
    html: longHtml,
  },
  {
    slug: 'shipping-a-game-with-three-people',
    title: 'Shipping a game with three people',
    date: '2026-08-14',
    description:
      'Word Factori sold 47,000 copies. Here is what the programming side actually looked like.',
    readingMinutes: 9,
    cover: '/wordfactori-screenshot.png',
    html: longHtml,
  },
  {
    slug: 'physics-as-explanation',
    title: 'Physics animations as an explanation tool',
    date: '2026-03-30',
    description: 'Why RCV Changed Alaska used bouncing balls instead of bar charts.',
    readingMinutes: 4,
    cover: '/rcvchangedalaska-screenshot.png',
    html: longHtml,
  },
  {
    slug: 'notes-on-ai-first-development',
    title: 'Notes on AI-first development',
    date: '2025-11-08',
    description: 'A short one. What changed when the agent wrote the first draft of everything.',
    readingMinutes: 3,
    html: longHtml,
  },
  {
    slug: 'hello-world',
    title: 'Hello, world',
    date: '2025-09-01',
    description: 'Why this blog exists.',
    readingMinutes: 1,
    html: longHtml,
  },
]

export function formatDate(iso: string, style: 'long' | 'short' = 'long') {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
  })
}
