import { Button } from './components/Button'
import { InlineLink } from './components/InlineLink'
import { Nav } from './components/Nav'
import { ProjectCard } from './components/ProjectCard'
import { useActiveSection } from './hooks/useActiveSection'

const colorTokens = [
  { name: '--color-bg', hex: '#0f0f0f' },
  { name: '--color-surface', hex: '#1a1a1a' },
  { name: '--color-border', hex: '#2e2e2e' },
  { name: '--color-body', hex: '#e8e8e8' },
  { name: '--color-muted', hex: '#888888' },
  { name: '--color-accent', hex: '#f97316' },
  { name: '--color-accent-dark', hex: '#ea6c0a' },
]

const navLinks = [
  { label: 'Colors', href: '#colors' },
  { label: 'Typography', href: '#typography' },
  { label: 'Buttons', href: '#buttons' },
  { label: 'Links', href: '#links' },
  { label: 'Cards', href: '#cards' },
]

const sampleCards = [
  {
    name: 'Pixel Platformer',
    role: 'Solo developer — design, code, and art',
    hook: 'A retro-style 2D platformer built in Unity with procedurally generated levels and a chiptune soundtrack.',
    stack: ['Unity', 'C#', 'Aseprite'],
    links: [
      { label: 'Live Site', href: 'https://example.com/pixel-platformer' },
      { label: 'Source', href: 'https://github.com/example/pixel-platformer' },
    ],
  },
  {
    name: 'Recipe Keeper',
    role: 'Full-stack developer',
    hook: 'A mobile-first web app for saving, tagging, and scaling recipes, with offline support via service workers.',
    stack: ['React', 'TypeScript', 'Tailwind CSS'],
    links: [{ label: 'Live Site', href: 'https://example.com/recipe-keeper' }],
  },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-widest text-muted mb-6">{children}</p>
  )
}

function App() {
  const sectionIds = navLinks.map((l) => l.href.slice(1))
  const activeSectionId = useActiveSection(sectionIds)
  const activeHref = activeSectionId ? `#${activeSectionId}` : undefined

  return (
    <>
      <Nav siteName="Stylebook" links={navLinks} activeHref={activeHref} />
      <div className="min-h-screen bg-bg text-body font-sans px-8 py-12 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Stylebook</h1>
        <p className="text-muted mb-16">Design system reference — colors, type, and components</p>

        <section id="colors" className="mb-16">
          <SectionLabel>Color Palette</SectionLabel>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {colorTokens.map(({ name, hex }) => (
              <div key={name}>
                <div
                  className="h-16 rounded-md border border-border mb-2"
                  style={{ backgroundColor: hex }}
                />
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted">{hex}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="typography" className="mb-16">
          <SectionLabel>Typography</SectionLabel>
          <div className="space-y-4">
            <p className="text-5xl font-bold">Heading 1</p>
            <p className="text-4xl font-bold">Heading 2</p>
            <p className="text-3xl font-semibold">Heading 3</p>
            <p className="text-base">Body — The quick brown fox jumps over the lazy dog</p>
            <p className="text-base text-muted">Muted — Secondary information, labels, captions</p>
          </div>
        </section>

        <section id="buttons" className="mb-16">
          <SectionLabel>Buttons</SectionLabel>
          <div className="flex gap-4 flex-wrap items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="primary" disabled>
              Primary Disabled
            </Button>
            <Button variant="secondary" disabled>
              Secondary Disabled
            </Button>
          </div>
        </section>

        <section id="links" className="mb-16">
          <SectionLabel>Links</SectionLabel>
          <div className="space-y-4">
            <p className="text-base">
              This is a sentence with an <InlineLink href="#">inline link</InlineLink> styled in
              accent color, and another that{' '}
              <InlineLink href="https://example.com" external>
                opens externally
              </InlineLink>{' '}
              in a new tab.
            </p>
            <p>
              <InlineLink href="#">Standalone link →</InlineLink>
            </p>
          </div>
        </section>

        <section id="cards" className="mb-16">
          <SectionLabel>Project Cards</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sampleCards.map((card) => (
              <ProjectCard key={card.name} {...card} />
            ))}
          </div>
        </section>
        <div className="h-[60vh]" aria-hidden="true" />
      </div>
    </>
  )
}

export default App
