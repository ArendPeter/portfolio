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
   Write like a person, plainly.
5. **Call to action:** Point to both arendpeter.com (the portfolio, for anyone
   who wants to see the work) and calendly.com/arendpeter/30min (for a direct
   next step). Don't rely on the calendly link alone.
6. **Output** the draft directly in the response (not written to a file, unless
   asked) so Arend can iterate on it in conversation.

## Notes

- This is a pure content-generation skill — no app to launch, no build step, no
  driver script. The "harness" is `content.md` itself as the data source.
- If `content.md` seems out of date relative to what Arend describes about
  himself in conversation, flag the discrepancy rather than silently using the
  stale version.
