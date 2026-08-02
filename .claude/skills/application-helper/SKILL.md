---
name: application-helper
description: Draft cover letters, cold emails, and LinkedIn messages for job applications, pulling relevant experience from content.md to connect Arend's background to a specific company or role. Use when Arend asks to write/draft a cover letter, cold email, or LinkedIn message for a job application.
---

# Application Helper

Drafts application writing (cover letters, cold emails, LinkedIn messages) tailored
to a specific job or company, grounded in `content.md` at the repo root — the
canonical source of Arend's experience, portfolio projects, and skills.

## Inputs

Each invocation, the user provides:

1. **The job/company** being applied to (name, and ideally the job posting or a
   description of the role — paste text or a link if available).
2. **The writing type**: cover letter, cold email, or LinkedIn message (or another
   type if requested — e.g. a referral request).

If either is missing or vague, ask before drafting.

Arend often adds extra context beyond these two things — why he's applying this
way, how he found the role, background on the company, etc. Treat this as
**situational context to weigh, not literal instructions to include.** He's
handing over signal for judgment calls, the same way content.md is signal, not
a script. Don't surface the meta-context directly in the draft unless it
actually strengthens the pitch (e.g. "cold emailing because I couldn't find a
LinkedIn contact" is context for you, not a line for the message; but "a
mutual contact suggested I reach out" might be worth keeping if it adds
credibility). When in doubt, ask which pieces of what he said should shape the
draft vs. just inform it.

## Process

1. **Read `content.md`** (repo root) fresh each time — don't rely on memory of it,
   it may have been edited. Pay special attention to:
   - Section 2 (About) and Section 3 (Portfolio) for concrete stories
   - Section 5 (Experience) for role-specific detail
   - Section 6 (Skills) for keyword matching against the job posting
   - Appendix C (Leadership Philosophy / Mock Interview Q&A) and Appendix E
     (Unused Nuggets) — these hold stories that don't fit the site but are gold
     for cover letters (e.g. the Deployment Letter, mentoring, Astra fund, board
     directorship)
2. **Match to the role.** Identify 2-4 concrete points of connection between the
   job posting/company and Arend's background — prefer specific projects and
   outcomes (e.g. "led bettervoting.com to production," "$200K revenue at Star
   Garden Games," "built EC2 boot time monitoring at Amazon") over generic trait
   claims. If the company is mission-driven, lean on the Equal Vote / civic tech
   throughline. If it's product/eng-culture-driven, lean on Amazon + Star Garden
   Games technical leadership.
3. **Draft in the right form:**
   - **Cover letter:** 3-4 paragraphs. Opening hook tied to the company's mission
     or product, 1-2 paragraphs of relevant proof points, closing with a call to
     action (e.g. link to [calendly.com/arendpeter/30min](https://calendly.com/arendpeter/30min)).
   - **Cold email:** Short — under 150 words. Subject line + 2-3 tight paragraphs.
     Assume a busy recipient (hiring manager, recruiter, or referral contact).
     End with a specific, low-friction ask (15-min call, or "happy to send my
     resume/portfolio").
   - **LinkedIn message:** Very short — 2-4 sentences, conversational register,
     no subject line. Assume character limits; get to the point fast.
4. **Tone:** Confident, concrete, no generic filler ("passionate," "hardworking,"
   "team player" without evidence). Every claim should trace back to something in
   `content.md`. Avoid over-claiming placeholders still marked `[X]` in the
   content file — either omit them or ask Arend for the real number first.
   Avoid "AI voice" — no em dashes, no formulaic tricolons, no hedging filler.
   Write like a person, plainly. In particular, don't quote or paraphrase the
   target company's own marketing language/slogans/values back at them as
   connective tissue, especially not wrapped in a "rather than X, Y" or similar
   balanced-clause construction — that reads as distinctly AI-generated. Either
   skip the connective sentence and jump straight to the proof point, or make
   the connection concrete (a project, a number) instead of abstract
   value-matching. Same tell in a different shape: don't write a sentence that
   explicitly names the abstraction connecting past work to the target role
   (e.g. "which is the same shape of problem X faces: making large datasets
   legible..."). State the concrete fact and let the reader draw the parallel;
   explaining the parallel out loud reads as AI reasoning. Prefer one strong
   proof point over two stacked ones. Prefer plain declaratives over hedges
   ("X aligns with Y" beats "X isn't new territory for me"). Prefer modest
   verbs over self-crediting ones ("used Kysely" beats "learned Kysely")
   unless picking up a genuinely new skill is the actual point being made.
5. **Call to action:** Point to both arendpeter.com (the portfolio, for anyone
   who wants to see the work) and calendly.com/arendpeter/30min (for a direct
   next step). Don't rely on the calendly link alone.
6. **Signature (cover letter and cold email only):** End with a signature block
   after the sign-off, one link per line, in this order — portfolio, meeting
   link, LinkedIn. This is separate from the in-body call to action in step 5 —
   the signature is a fixed reference block, not phrased as a sentence. Skip it
   for LinkedIn messages (the platform already surfaces the profile and links
   read as clutter in a short DM). Style varies by formality:
   - **Cover letter** (more formal — plain, no labels/emojis):
     ```
     Arend Peter Castelein
     arendpeter.com
     calendly.com/arendpeter/30min
     github.com/ArendPeter
     linkedin.com/in/arend-peter-castelein-530a5070
     ```
   - **Cold email** (more casual — labeled with emoji):
     ```
     Arend Peter Castelein
     💻 Portfolio: arendpeter.com
     📅 Let's meet: calendly.com/arendpeter/30min
     🐙 GitHub: github.com/ArendPeter
     💼 LinkedIn: linkedin.com/in/arend-peter-castelein-530a5070
     ```
7. **Personalize with name.** Work "Arend" or "Arend Peter Castelein" in more
   than just the sign-off:
   - **Subject line** (cold email): include the name, e.g. "Arend Castelein —
     Full Stack Engineer for [Role]" or "Introduction from Arend Castelein."
   - **First sentence**: introduce by name AND signal this message is written
     specifically for this company/role, not a template — reference something
     concrete about the company (product, mission, a recent detail from the
     job posting) rather than opening with a generic "I'm Arend, a full stack
     engineer who...". A recruiter skims in seconds; the opening line has to
     prove effort was put in before they read further. E.g. "My name is Arend
     Peter Castelein — I've been following [Company]'s work on [specific
     thing], and it reminded me of leading bettervoting.com from ideation to
     production."
   - **Sign-off**: name as before.
   - Use first name alone in casual contexts (LinkedIn messages, cold emails to
     a specific person), and full name in more formal contexts (cover letters,
     first introduction to a company) or the subject line.
8. **Output** the draft directly in the response (not written to a file, unless
   asked) so Arend can iterate on it in conversation.

## Notes

- This is a pure content-generation skill — no app to launch, no build step, no
  driver script. The "harness" is `content.md` itself as the data source.
- If `content.md` seems out of date relative to what Arend describes about
  himself in conversation, flag the discrepancy rather than silently using the
  stale version.
