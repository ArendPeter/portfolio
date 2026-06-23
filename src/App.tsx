import './App.css'
import { Button } from './components/Button'

const colorTokens = [
  { name: '--color-bg', hex: '#0f0f0f' },
  { name: '--color-surface', hex: '#1a1a1a' },
  { name: '--color-border', hex: '#2e2e2e' },
  { name: '--color-body', hex: '#e8e8e8' },
  { name: '--color-muted', hex: '#888888' },
  { name: '--color-accent', hex: '#f97316' },
  { name: '--color-accent-dark', hex: '#ea6c0a' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-widest text-muted mb-6">{children}</p>
  )
}

function App() {
  return (
    <div className="min-h-screen bg-bg text-body font-sans px-8 py-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Stylebook</h1>
      <p className="text-muted mb-16">Design system reference — colors, type, and components</p>

      {/* Color Palette */}
      <section className="mb-16">
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

      {/* Typography */}
      <section className="mb-16">
        <SectionLabel>Typography</SectionLabel>
        <div className="space-y-4">
          <p className="text-5xl font-bold">Heading 1</p>
          <p className="text-4xl font-bold">Heading 2</p>
          <p className="text-3xl font-semibold">Heading 3</p>
          <p className="text-base">Body — The quick brown fox jumps over the lazy dog</p>
          <p className="text-base text-muted">Muted — Secondary information, labels, captions</p>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-16">
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
    </div>
  )
}

export default App
