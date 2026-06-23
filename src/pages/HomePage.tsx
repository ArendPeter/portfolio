import { Nav } from '../components/Nav'
import { useActiveSection } from '../hooks/useActiveSection'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Impact', href: '#business-impact' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]

const sectionIds = navLinks.map((l) => l.href.slice(1))

export function HomePage() {
  const activeSectionId = useActiveSection(sectionIds)
  const activeHref = activeSectionId ? `#${activeSectionId}` : undefined

  return (
    <>
      <Nav siteName="Arend Peter Castelein" links={navLinks} activeHref={activeHref} />
      <div className="min-h-screen bg-bg text-body font-sans px-8 py-12 max-w-4xl mx-auto">
        <section id="hero" className="mb-16">
          {/* Hero */}
        </section>

        <section id="about" className="mb-16">
          {/* About */}
        </section>

        <section id="portfolio" className="mb-16">
          {/* Portfolio */}
        </section>

        <section id="business-impact" className="mb-16">
          {/* Business Impact */}
        </section>

        <section id="experience" className="mb-16">
          {/* Experience */}
        </section>

        <section id="skills" className="mb-16">
          {/* Skills */}
        </section>

        <section id="contact" className="mb-16">
          {/* Contact */}
        </section>

        <div className="h-[60vh]" aria-hidden="true" />
      </div>
    </>
  )
}
