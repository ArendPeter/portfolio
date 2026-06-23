import { Button } from '../components/Button'
import { Nav } from '../components/Nav'
import { scrollToFragment } from '../utils/scroll'
import { useActiveSection } from '../hooks/useActiveSection'
import { ProjectCard } from '../components/ProjectCard'
import { InlineLink } from '../components/InlineLink'
import { navLinks } from './homeNavLinks'

const sectionIds = navLinks.map((l) => l.href.slice(1))

const CALENDLY_URL = 'https://calendly.com/arendpeter/30min'
const GITHUB_URL = 'https://github.com/ArendPeter/'

const projects = [
  {
    name: 'bettervoting.com',
    role: 'Production Lead → Program Director, Equal Vote Coalition',
    hook: 'A professional-grade, open source election platform built by a distributed volunteer team. I was a leader in the project through every phase of development: from early ideation, to the development, to working directly with clients running real elections.',
    stack: ['React', 'Node.js', 'Kysely ORM', 'PostgreSQL', 'Kubernetes/ArgoCD', 'MUI'],
    links: [
      { label: 'bettervoting.com', href: 'https://bettervoting.com' },
      { label: 'Source Code', href: 'https://github.com/Equal-Vote/bettervoting' },
    ],
  },
  {
    name: 'Word Factori',
    role: 'Programming Lead, Star Garden Games',
    hook: 'Word Factori is a factory building game where you build letters from the letter I, built by a three-person team. Word Factori sold over 47,000 copies and has been played by high profile streamers such as the Northern Lion and Real Civil Engineer.',
    stack: ['Game Maker'],
    links: [
      { label: 'Steam Page', href: 'https://store.steampowered.com/app/2072840/Word_Factori/' },
    ],
  },
  {
    name: 'rcvchangedalaska.com',
    role: 'Solo Developer',
    hook: 'A standalone web project explaining a complex political issue — problems with ranked choice voting in Alaska — through physics-based interactive animations.',
    stack: ['JavaScript', 'React'],
    links: [{ label: 'rcvchangedalaska.com', href: 'https://rcvchangedalaska.com' }],
  },
  {
    name: 'ieltsboost.ai',
    role: 'Software Contributor with ML Ventures',
    hook: 'An AI-native application to help non-native English speakers prepare for the IELTS exam. Built using AI-first development workflows from the ground up.',
    stack: ['Next.js', 'Tailwind'],
    links: [{ label: 'ieltsboost.ai', href: 'https://ieltsboost.ai' }],
  },
]

export function HomePage() {
  const activeSectionId = useActiveSection(sectionIds)
  const activeHref = activeSectionId ? `#${activeSectionId}` : undefined

  return (
    <>
      <Nav siteName="Arend Peter Castelein" links={navLinks} activeHref={activeHref} />
      <div className="min-h-screen bg-bg text-body font-sans px-8 py-12 max-w-4xl mx-auto">
        <section id="hero" className="mb-16">
          <h1 className="text-4xl font-bold mb-2">Arend Peter Castelein</h1>
          <p className="text-xl text-muted mb-8">
            Full Stack Engineer with a track-record of leadership
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Button href={CALENDLY_URL} external>
              Schedule a Call
            </Button>
            <Button
              href="#portfolio"
              variant="secondary"
              onClick={(e) => scrollToFragment(e, '#portfolio')}
            >
              View My Work
            </Button>
            <InlineLink href={GITHUB_URL} external>
              GitHub
            </InlineLink>
          </div>
        </section>

        <section id="about" className="mb-16">
          <h2 className="text-2xl font-bold mb-6">About</h2>
          <p className="leading-relaxed mb-4">
            I'm a full stack engineer with a track record of finding the bottlenecks that hold teams
            back — and building the tools, processes, and infrastructure to remove them.
          </p>
          <p className="leading-relaxed">
            As a Software Engineer at Amazon I turned faced legacy workflows built on tribal
            knowledge, and built them into documented and automated processes. As the Programming
            Lead at Star Garden Games I was responsible for delivering an optimized production ready
            game and built the tooling that gave our artist full creative independence. As the
            Production Lead at Equal Vote I led a team of volunteers to build an elections project
            into a service that has now processed tens of thousands of votes. Now as the Program
            Director at Equal Vote I've also grown as a leader, managing dozens of volunteers and
            helping to standardize processes across the organization. The AI era has allowed to take
            my work to the next level without sacrificing quality, whether it's writing quality test
            driven code, building custom auditing tools, or brainstorming nuanced ideas.
          </p>
        </section>

        <section id="portfolio" className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        </section>

        <section id="business-impact" className="mb-16">
          {/* Business Impact */}
        </section>

        <section id="experience" className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Experience</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold">
              Equal Vote Coalition — Program Director / Production Lead
            </h3>
            <p className="text-sm text-muted mb-3">2021 – Present</p>
            <p className="mb-3">
              Began as a volunteer frontend developer and grew into a staff leadership role over
              five years.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Program Director:</strong> Oversee the full program map across technical
                teams (bettervoting.com dev), volunteer onboarding pipeline, and communications
                committee. Lead cross-functional initiatives including the LA STAR voting chapter.
                Board Director at Star Voting Action.
              </li>
              <li>
                <strong>Production Lead:</strong> Led bettervoting.com from ideation through
                production. Managed volunteer engineers, client relationships, documentation, and
                infrastructure. Owned the full technical stack to ensure coverage across all roles.
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold">Star Garden Games — Programming Lead</h3>
            <p className="text-sm text-muted mb-3">2021 – Present</p>
            <p>
              Engineering lead for an independent game studio. Shipped 3 production titles and
              developed dozens more. Responsibilities include all engineering, artist tooling,
              publisher relations, and project management.
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold">Amazon — Software Development Engineer</h3>
            <p className="text-sm text-muted mb-3">2016 – 2021</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>CodeCommit Team (2019–2021):</strong> Designed and built a new code search
                platform. Established infrastructure-as-code standards using AWS CDK and end-to-end
                testing practices. Mentored junior engineers.
              </li>
              <li>
                <strong>Amazon Linux Team (2017–2019):</strong> Built EC2 boot time monitoring
                system feeding leadership dashboards. Reduced deployment process risk through
                documentation and automation of a previously tribal, manual process.
              </li>
              <li>
                <strong>Intern (2016):</strong> Built automated testing infrastructure for EC2 t2
                instance credit logic — legacy code that no engineer was willing to touch. The test
                suite gave the team confidence to iterate on thousands of lines of untouched code.
              </li>
            </ul>
          </div>
        </section>

        <section id="skills" className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Skills</h2>
          <dl className="space-y-2">
            <div className="flex gap-2">
              <dt className="font-semibold w-36 shrink-0">Languages</dt>
              <dd>JavaScript, TypeScript, HTML/CSS, Python, Java</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold w-36 shrink-0">Frontend</dt>
              <dd>React, physics/animation (browser-native)</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold w-36 shrink-0">Backend</dt>
              <dd>Node.js, Kysely ORM, database migrations</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold w-36 shrink-0">Infrastructure</dt>
              <dd>Kubernetes, ArgoCD, AWS CDK, EC2</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold w-36 shrink-0">Game Dev</dt>
              <dd>Game Maker, event-driven systems, real-time tooling</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold w-36 shrink-0">Leadership</dt>
              <dd>
                Volunteer management, stakeholder communication, technical documentation, meeting
                design
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold w-36 shrink-0">AI Tooling</dt>
              <dd>Claude Code, Descript, AI-native development workflows</dd>
            </div>
          </dl>
        </section>

        <section id="contact" className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Contact</h2>
          <dl className="space-y-3">
            <div className="flex gap-2">
              <dt className="font-semibold">Schedule a call:</dt>
              <dd>
                <InlineLink href={CALENDLY_URL} external>
                  calendly.com/arendpeter/30min
                </InlineLink>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold">GitHub:</dt>
              <dd>
                <InlineLink href={GITHUB_URL} external>
                  github.com/ArendPeter
                </InlineLink>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold">Email:</dt>
              <dd>
                <InlineLink href="mailto:apc1993@gmail.com">apc1993@gmail.com</InlineLink>
              </dd>
            </div>
          </dl>
        </section>

        <div className="h-[60vh]" aria-hidden="true" />
      </div>
    </>
  )
}
