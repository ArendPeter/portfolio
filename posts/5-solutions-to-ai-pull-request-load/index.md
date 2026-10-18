---
title: 5 solutions to AI Pull Request Load
date: 2026-10-17
---

![[PR_Capacity.png]]

With AI, all teams are going through the same problem right now. Our ability to generate code has increased massively, but our ability to review the code has not been able to keep up. I've been fascinated by this problem, and I've found 5 strategies that teams are using to address it. Here we go.

## 1. PR Review Culture

This article will have technical solutions as well, but for some teams the solution they need might just be human: [PR culture reflects the team culture](https://medium.com/@oluwasayo/pull-requests-where-engineering-culture-lives-57f6327631d3). On a well performing team, PRs should get reviewed within day (or ideally within a few hours), and they should be small enough to be reviewed quickly without too many revisions. A struggling team can have PRs in the queue for days or weeks, with many comments and an antagonistic review cycle.

Code Review needs to actually be prioritized by the team for it to happen in a timely manner, and team members need to feel ownership over their reviews rather than seeing it as a chore. That culture can be built by celebrating good PRs and quick reviews, but another approach is to add context and transparency through surfacing PR metrics. Surfacing the Time-to-first-review, and PR size metrics in retrospective meetings on it's own can already clarify where improvements need to be made and it helps teams adjust accordingly.

PR culture was already a big topic before the AI era, but now with the massive influx of AI-Generated PRs, the teams struggling with their PR culture will be the first to feel the pain. If that's you then returning to the fundamentals, could be the most important action to take right now.

## 2. Add more Automation

Having automated checks on PRs has become common practice, but AI has created a renewed interest to take this to the next level. Adding more automated checks will give immediate feedback to developers, reduce review cycles, and if implemented as a commit hook, then it can also increase the chances of our agents one-shotting their implementation.

### Custom Linters

In addition to unit testing, running the build, and adding linters, creating custom linters is another great option. These linters can be surprisingly involved, sometimes 100s of lines of code parsing the Abstract Syntax Tree, so if you notice a pattern in your review comments, then you can probably write a linter for it so the feedback is delivered to the developer faster. With AI written code, we can also afford write strict linters without worrying about creating an annoying experience for developers.

### Proof Based Verification

Using [Bend Lang](https://bend-lang.com/) for verification is another up and coming verification approach. With Bend you set hard rules that your code must satisfy. For example, I've been leading development of [an elections platform](http://bettervoting.com/) and we could set a rule to ensure that authenticated voters may not vote twice. Bend will take that rule and use fancy graph theory to mathematically verify that the rule is satisfied on the codebase. These assurances reduce review effort, but they also make it impossible for the AI to introduce rule violating bugs in the future.

### Automatic Merging

On the extreme end of automation, teams are also experimenting with automatic merging. Its usually starts with the [lower risk dependabot PRs](https://lethain.com/dependabot-auto-merge/) , but some teams have built enough trust in their verification to reach [100% automatically merged PRs](https://x.com/poteto/status/2102050467505430555).

If your team frequently has "rubber stamp PRs" that are low risk and require minimal review, then those could be good candidates for automatic merging. Even without automatic merging, the exercise of adding automatic classifiers to your PRs (low, medium, high risk, for example) on it's own can allow reviewers to streamline their process. Just knowing at a glance which PRs require deep review, and which ones are quick can be helpful can make your team more efficient.

## 3. Make large PRs easier to review

AI writing more code, also means it can be harder to keep reviews small. That's likely why the industry has showed a renewed interest in stacked PRs.

This is nostalgic for me. During my first job at a big tech company, my first few months were spent building a side project on my own. I had no other responsibilities and lots of time to code, so naturally I felt my development outpacing my teams capacity to review my PRs. My solution at the time was to stack my changes. I'd have 1 PR open at a time, but locally I'd build further and could end up having up to a dozen commits on top of that feature. When comments came in on the PR, I'd use [git's interactive rebase feature](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History) to apply the changes to the PR commits, and then rebase the local commits on top of them. This got old really fast. Fixing conflicts during the rebase was tedious work, and it created a natural limit to how far I could with my stacked features. As I became more senior my attention got spread across more meetings and projects, I could no longer outpace my PRs in the same way, so stacked commits were no longer relevant.

Now stacked commits are making a come back, and [GitHub has now released support for displaying stacked changes within the pull request](https://github.blog/changelog/2026-07-30-stacked-pull-requests-are-now-in-public-preview/). Previously I could only get ahead of my PRs with the free time that came with being a new hire, but now with AI we're all outpacing our PR reviews. On top of that, applying tedious rebases are exactly the sort of coding task that AI is really good at so stacking our PRs doesn't have the same cost to it.

This is just one of the many engineering practices that I'm seeing resurface in the AI era. Similarly Test Driven Development and Spec Driven Development were practices with limited adoption due to the friction in the engineer's workflow, but now with AI it's growing in popularity again.

## 4. Move the review phase earlier

Speaking of Spec Driven Development, there's also a push to adjust the review artifact from code to a higher abstraction. I most recently read about it in [Accountable Software in the Age of AI-Generated Code](https://www.amazon.com/dp/B0GSL8Y7XM). We're already comfortable reviewing at a high level abstraction, that's why we review code in Python instead of the underlying assembly language that it gets compiled down to. So if code is now being generated from prompts, why not just review the prompt? The big difference is that the compiler is deterministic whereas the AI code generation is unpredictable, but with a detailed enough spec, and with enough trust built through our verification tooling, then we could enter a world where we review specs instead of code. The specs can be committed to the repo along with the code it generated, similarly to a Architectural Decision Record, and then reviewer could just review the spec, instead of the thousands of lines of code which correspond to it.

## 5. Pair Programming

Another approach is to eliminate PRs entirely, and instead [switch to pair programming](https://www.youtube.com/watch?v=ASOSEiJCyEM&t=452s). Pull Requests were an imperfect solution designed for low trust teams of distributed developers working on open source projects. Even when teams have a solid PR culture, pull requests will still add a delays to development, and hurt engineer productivity through added context switching. On top of that PR comments are a poor medium for mentoring conversations.

Software developed in companies don't have the same restrictions as distributed open source projects. Developers are trusted, and usually they're either working in the same office, or at least working in a similar time zone. Requiring that all code be written in pairs can feel like a waste of engineering resources, but it also eliminates the inefficiencies of the PR review process, builds teamwork, and creates a natural medium for mentoring junior engineers.

Pair programming also tracks with the theme of pushing the abstraction of the review artifact. If engineers are prompting together they're effectively collaboratively reviewing the prompts as the artifact, and so the developer and the reviewer are aligned.

## Choose your own adventure

We've reviewed 5 approaches teams are taking to resolve the Pull Request bottleneck of AI generated code, but the solution you pursue will depend on the team. Aiming for a 2 hour "Time to first review" metric, could be feasible within a company, but not a distributed team of volunteers. Automatically merging PRs could be viable for a new start up that's moving fast, but impossible for a established company aiming to maintain SOC2 compliance.

The ideal flow for your team would probably be a combination of everything. Maybe automatic merges can apply to a small percentage of low risk PRs, and pair programming can be a tool you use to streamline buy-in for the high risk ones? It's choose your own adventure. I know I'm excited to find the right fit for the teams I work and hopefully this helps to give you ideas as well.

My takeaway is that good engineering matters more than ever. All of these practices existed before AI, but now good practices are becoming even more important. As the role of engineering evolves, and AI becomes more and more effective and building features, our work will likely shift to maintaining good processes to empower our AI agents.
