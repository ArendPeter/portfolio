import { GitHubCalendar } from 'react-github-calendar'
import { Button } from '../components/Button'
import { Nav } from '../components/Nav'
import { scrollToFragment } from '../utils/scroll'
import { useActiveSection } from '../hooks/useActiveSection'
import { ProjectCard } from '../components/ProjectCard'
import { InlineLink } from '../components/InlineLink'
import { navLinks } from './homeNavLinks'
import { cn } from '../utils/utils'

const githubCalendarTheme = {
  dark: ['#1a1a1a', '#3a1f00', '#7a3f00', '#c46200', '#f97316'],
}

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
    screenshotSrc: '/bettervoting-screenshot.png',
    screenshotAlt: 'bettervoting.com election platform',
    videoSrc: '/bettervoting-video.mp4',
  },
  {
    name: 'Word Factori',
    role: 'Programming Lead, Star Garden Games',
    hook: 'Word Factori is a factory building game where you build letters from the letter I, built by a three-person team. Word Factori sold over 47,000 copies and has been played by high profile streamers such as the Northern Lion and Real Civil Engineer.',
    stack: ['Game Maker'],
    links: [
      { label: 'Steam Page', href: 'https://store.steampowered.com/app/2072840/Word_Factori/' },
    ],
    screenshotSrc: '/wordfactori-screenshot.png',
    screenshotAlt: 'Word Factori: Letter building steam game',
    videoSrc: '/wordfactori-video.mp4',
  },
  {
    name: 'rcvchangedalaska.com',
    role: 'Solo Developer',
    hook: 'A standalone web project explaining a complex political issue — problems with ranked choice voting in Alaska — through physics-based interactive animations.',
    stack: ['JavaScript', 'React'],
    links: [
      { label: 'rcvchangedalaska.com', href: 'https://rcvchangedalaska.com' },
      { label: 'Source Code', href: 'https://github.com/Equal-Vote/alaska-rcv' },
    ],
    screenshotSrc: '/rcvchangedalaska-screenshot.png',
    screenshotAlt:
      'RCVChangedAlaska: An interactive explainer featuring the 2022 Alaska RCV election',
    videoSrc: '/rcvchangedalaska-video.mp4',
  },
  {
    name: 'ieltsboost.ai',
    role: 'Software Contributor with ML Ventures',
    hook: 'An AI-native application to help non-native English speakers prepare for the IELTS exam. Built using AI-first development workflows from the ground up.',
    stack: ['Next.js', 'Tailwind'],
    links: [{ label: 'ieltsboost.ai', href: 'https://ieltsboost.ai' }],
  },
]

type PhotoProps = React.HTMLAttributes<HTMLDivElement>
const Photo = ({ className }: PhotoProps) => (
  <div
    className={cn(
      'shrink-0 w-56 h-56 md:w-72 md:h-72 rounded-full bg-muted/20 border-2 border-muted/30 flex items-center justify-center overflow-hidden',
      className,
    )}
  >
    <img src="/selfie.jpg" alt="Arend Peter Castelein" className="w-full h-full object-cover" />
  </div>
)

export function HomePage() {
  const activeSectionId = useActiveSection(sectionIds)
  const activeHref = activeSectionId ? `#${activeSectionId}` : undefined

  const currentYear = new Date().getFullYear()

  return (
    <>
      <Nav siteName="Arend Peter Castelein" links={navLinks} activeHref={activeHref} />
      <div className="min-h-screen bg-bg text-body font-sans px-8 py-12 max-w-230 mx-auto flex flex-col gap-16">
        <section id="hero" className="flex gap-16 items-center min-h-[calc(75vh-6rem)]">
          <div className="flex flex-col md:flex-row items-center gap-8 w-full">
            <div className="flex flex-col min-w-0 text-center items-center md:text-left md:items-start gap-4">
              <div>
                <h1 className="text-4xl font-bold">Arend Peter Castelein</h1>
                <p className="text-xl text-muted pt-2">Ex-Amazon Full Stack Engineer</p>
              </div>
              <Photo className="flex md:hidden" />
              <p className="leading-relaxed py-4">
                I have 10+ years of experience, and a{' '}
                <InlineLink href="#experience" onClick={(e) => scrollToFragment(e, '#experience')}>
                  track record
                </InlineLink>{' '}
                of leadership. I&nbsp;identify&nbsp;team&nbsp;bottlenecks and resolve them.
                {/* — and building the tools, processes, and infrastructure to remove them.*/}
              </p>
              <div className="flex flex-wrap gap-4 items-center justify-center">
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
              </div>
            </div>
          </div>
          <Photo className="hidden md:flex" />
        </section>

        <section id="portfolio" className="">
          <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.name} {...project} />
            ))}
          </div>
        </section>

        <section id="resume" className="">
          <h2 className="text-2xl font-bold mb-6">Resume</h2>
          <div className="flex justify-center">
            <Button href="/arend-peter-resume.pdf" external>
              View Resume
            </Button>
          </div>
        </section>

        <section id="experience" className="">
          <h2 className="text-2xl font-bold mb-6">Experience</h2>

          <div className="mb-8">
            <h3 className="text-xl font-semibold">Equal Vote Coalition — Program Director</h3>
            <InlineLink href="https://equal.vote" external>
              equal.vote
            </InlineLink>
            <p className="mt-3">
              Began as a volunteer Frontend Developer and grew into a staff leadership role over
              five years.
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>
                <strong>Program Director</strong>{' '}
                <span className="text-sm text-muted">(2026 - present)</span>: Oversaw cross
                functional initiatives including our national chapter program, the national
                volunteer onboarding pipeline, and our communications committee. I also served as a
                Board Director at Star Voting Action.
              </li>
              <li>
                <strong>Production Lead</strong>{' '}
                <span className="text-sm text-muted">(2024 - 2026)</span>: I led a team of
                volunteers to build the BetterVoting.com elections project into a service that has
                now processed tens of thousands of votes. Throughout development I maintained
                context on the full technical stack from React to Kubernetes to ensure coverage
                across all roles.
              </li>
              <li>
                <strong>Volunteer Developer</strong>{' '}
                <span className="text-sm text-muted">(2021 - 2024)</span>: Engaged in the ideation
                of the BettingVoting.com elections project and resolved early bottlenecks such as
                developing technical onboarding documentation. Also built rcvchangedalaska.com as an
                interactive explainer tool.
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold">Star Garden Games — Programming Lead</h3>
            <InlineLink href="https://stargardengames.com" external>
              stargardengames.com
            </InlineLink>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>
                <strong>Programming Lead</strong>{' '}
                <span className="text-sm text-muted">(2021 – Present)</span>: I was responsible for
                delivering an optimized production ready game and building the tooling to gave our
                artist full creative independence. We shipped 3 production titles and developed a
                dozen more. The steam release has sold over 40k copies, and the mobiles releases
                have been installed across 100k devices.
              </li>
            </ul>
          </div>

          <div className="">
            <h3 className="text-xl font-semibold">Amazon — Software Development Engineer II</h3>
            <InlineLink href="https://amazonaws.com" external>
              amazonaws.com
            </InlineLink>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>
                <strong>CodeCommit Team</strong>{' '}
                <span className="text-sm text-muted">(2019 – 2021)</span>: Designed and built a new
                code search platform. Established infrastructure-as-code standards using AWS CDK and
                end-to-end testing practices. Mentored junior engineers.
              </li>
              <li>
                <strong>Amazon Linux Team</strong>{' '}
                <span className="text-sm text-muted">(2017 – 2019)</span>: Built EC2 boot time
                monitoring system feeding leadership dashboards. Reduced deployment risk through
                documentation and automation of a previously tribal, manual process.
              </li>
              <li>
                <strong>Intern</strong> <span className="text-sm text-muted">(2016)</span>: Built
                automated testing infrastructure for EC2 t2 instance credit logic — legacy code that
                no engineer was willing to touch. The test suite gave the team confidence to iterate
                on thousands of lines of untouched code.
              </li>
            </ul>
          </div>
        </section>

        <section id="skills" className="">
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

        <section id="github" className="">
          <h2 className="text-2xl font-bold mb-6">GitHub</h2>
          <div className="flex flex-col gap-8">
            <p className="flex justify-center">
              5+ years of consistent hands-on coding alongside leadership roles.
            </p>
            <div className="flex justify-center">
              <Button href={GITHUB_URL} external>
                View GitHub
              </Button>
            </div>
            {Array.from({ length: 3 }).map((_, i: number) => (
              <>
                <GitHubCalendar
                  key={i}
                  year={currentYear - i}
                  username="ArendPeter"
                  theme={githubCalendarTheme}
                  colorScheme="dark"
                  showColorLegend
                />
              </>
            ))}
          </div>
        </section>

        <section id="contact" className="">
          <h2 className="text-2xl font-bold mb-6">Contact</h2>
          <div className="flex justify-center items-center gap-6 flex-col md:flex-row">
            <Button href={CALENDLY_URL} external>
              Schedule a Call
            </Button>
            <span>
              Email Me:&nbsp;
              <InlineLink href="mailto:apc1993@gmail.com" external>
                apc1993@gmail.com
              </InlineLink>
            </span>
          </div>
        </section>

        <div className="h-[60vh]" aria-hidden="true" />
      </div>
    </>
  )
}
