---
title: My AI Workflow Part 1 - PLAN
date: 2026-10-30
---

How has AI impacted my development workflow? Today, I'll be working on a real world task on my queue, and show you step by step how I do it.

You'll largely find that this is a walkthrough of [Matt Pocock's AI Skills](https://www.youtube.com/@mattpocockuk), and this is on purpose. When someone is first getting into programming I recommend starting off by going deep on one programming language rather than spreading across multiple. That's the fastest way to pick up all the paradigms and then they transfer really easily to other programming languages from there. Learning AI development is no different. When I started watching Matt's videos his style really clicked with me. Previously I was worried that AI programming would build bad habits, but his videos made me see how I could use AI to produce more, while also becoming a better engineer. So I took his course, went all out with his suite of tools, and now 6 months later here's where I'm at.

## Phases of AI development

For some initial context, most people's AI coding workflows fall into one of these buckets:

- **Human in the loop**: When we start out with Claude, we're iterating on the code. Describe the problem, review the code output, then describe changes to the code.
- **Planning**: Next developers will shift to iterating on a plan instead of the raw code. This lets you iterate faster, and creates enough context for the AI to implement the feature fully AFK. At this phase you'll also have established back pressure so that the AI is forced to comply with unit tests, linters and other automations to ensure its code output is high quality.
- **Outer loop**: Once they have high enough confidence in their implementation workflow developers will build an outer loop to orchestrate the work. "Chief of staff" agents might triage ticket queues and resolve them on their own in the background. Developers are now managing the agent workflows rather than the tasks themselves.

My workflow is very much in the planning phase, however I hope to dabble with an outer loop in future posts. At this point I feel like the planning approach will still be necessary for features, but I could totally see an outer loop being effective for optimization, bug fixes, or technical debt.

## My Setup

All these steps use Claude Code in VSCode and I followed the steps on [Matt's skills repository](https://github.com/mattpocock/skills) to install the skills as a plugin. I use whatever the default model is for the agent; in this case that was Opus 5.5 with medium effort. So far the Pro subscription works fine for me. Sometimes I run out of tokens during the AFK workflows, but then I just restart them a few hours later.

## The Problem

Today, I'll add voter group / precinct UI to the BetterVoting.com elections platform. We have some use cases where voters are split into groups. For example, if an organization is split into branches (central, east, etc) and the races include a mix of branch leaders and at-large leaders. An election for a branch leader should only be accessible to voters in the respective branch, whereas the at large leaders should be accessible to all members.

It's great having this as a built in feature on BetterVoting.com, otherwise the election admins would need to manage multiple elections with different sets of voters for every permutation of the races. We've had backend support for a while, however it's never been released because the frontend support was so lacking. I've learned this the hard way when using the feature. It's currently really easy to misconfigure the voter group to race mapping and you could easily end up with voters seeing the wrong races on their ballot.

I've written up [a GitHub issue](https://github.com/Equal-Vote/bettervoting/issues/727) with a vision for an improved experience. The crux is to have a grid of checkboxes showing which voter groups map to each race. We'll use the issue as a starting point. (NOTE: now that the process is completed there are many sub-issues under that issue, but at time of writing there weren't any.)

![[voter-groups-race-grid-vision.png]]

## Grilling with Wayfinder

I start with [Matt's Wayfinder skill](https://www.youtube.com/watch?v=F3lL98Pj90o). I use Wayfinder to develop an ambiguous task into a detailed spec for the agent. Wayfinder can handle tasks of any scope, because it's designed to iterate on the specification across multiple agent sessions. There are also different types of sessions depending on which underlying skill is used, and the grill-with-docs skill is the most fundamental. grill-with-docs will inundate you with questions until the agent has the full unambiguous picture of the work that needs to be done.

So I start off with the following prompt:

```
/mattpocock-skills:wayfinder https://github.com/Equal-Vote/bettervoting/issues/727
```

Wayfinder is designed to work from an ambiguous starting point, so usually prompting with a few high level sentences about the task is sufficient, but I've already created a write up so I just handed it the issue URL directly. Here's the first output after a minute or two:

![[wayfinder-first-questions.png]]

It's jumped straight into a grilling session. Wayfinder/Grilling tries to answer its own questions with context from the codebase when possible, so it's already scanned the codebase and given an overview of the state of the precincts / voter group feature.

Q1 is trying to clarify the goal or destination of the session. That's usually the first question Wayfinder will ask you.

Q2 is working to establish canonical terms. This is the "-with-docs" part of the grill-with-docs skill. As you're conversing with the agent it will try to establish canonical terms in a GLOSSARY.md. This will streamline future communication with the agent, and as a knock on effect it may even streamline communication with your team. This is a perfect example since our project has been jumping between "precinct" and "voter group" without having a standard term. This has made it harder for agents and developers to understand the feature from the codebase. I'm excited for the idea of a standard glossary although honestly I haven't gone far enough to feel the benefits yet. I only have a handful of glossary terms in this repo so far, but I'll keep building it over time with conversations like these.

The remainder of the questions (7 total) further specify the scope. For each question the agent gives a recommended answer. The combination of the recommendations, and using [Wispr Flow](https://wisprflow.ai/) to dictate my answers allows me to iterate very quickly with the agent.

Here's what I answered for this example:

```
Q3: I plan for the scope of this change to be frontend only. The backend data model should remain the same. We're just improving how the voter groups are configured in the UI. That also satisfies Q7 and makes this change backwards compatible with previous voter group elections.

I agree with all other recommendations.
```

Notice how I was able to give an open-ended answer despite many of the agent's questions being binary. The agent is asking the questions to help us think through the problem, but it's still the responsibility of the developer to steer the conversation. That's also the reason why I have the AskAQuestion tool disabled in my Claude. That tool limits me to multiple choices, and also makes it harder to use Wispr Flow.

With the first round of questions answered the agent's frontier has expanded, and it uses that context to inform the next round of 5 questions.

![[wayfinder-second-round.png]]

This round actually made me change my mind about limiting the feature to the frontend. That shows the value of iterating via grilling. If I had changed my mind while writing the code, then reworking the decision would have been much more time consuming. I've also asked it to grill me further about that issue. In the initial round of wayfinder questions, it's totally okay to leave questions ambiguous. Wayfinder's initial goal is to just identify the list of open questions not the solutions. It can then dedicate separate sessions for those open questions. In this case it actually recommended a list of questions for further grilling in Q3, but I told it to rework them given my answer on Q1.

My answer:

```
Q1: This is making me second-guess my intuition to keep this on the frontend. Now I'm thinking the election should have a voter groups list. Voter groups must be specified in the settings first, and if the admin tries to add voters with groups outside of the list, then that's not allowed. This ensures that there won't be issues with typos between the voter roll and the election. This rule can still be backwards compatible with previous elections because it will only be enforced at the time of adding new voters. This decision might need to be grilled further in its own ticket.

Q2: I lean towards stored. So that way, the admin can toggle whether voter groups are enabled arbitrarily without having to respecify the list of voter groups. I also don't think we'll be specifying voter groups in the race editor anymore. That can be strictly specified in the settings page.

Q3: please come up with a new recommendation based on my previous answers.

agree on the rest
```

Then it comes up with a revised ticket shape. 3 grilling tickets for breaking down open questions, 1 prototyping ticket, and 1 research ticket.

![[wayfinder-revised-tickets.png]]

I say yes, and then wayfinder creates the following subissues in GitHub.

![[wayfinder-github-sub-issues.png|453]]

[Wayfinder: Voter Groups out of beta · Issue #1701 · Equal-Vote/bettervoting · GitHub](https://github.com/Equal-Vote/bettervoting/issues/1701) is generated and the description has an overview of the scope. Each ticket has a tag (for example, wayfinder:research) indicating the type of task. Currently I also manually add the "Track Via Parent" tag so that these issues can be filtered out of our triage queue. There are also blocking relationships, to create a clear order of operations for me and the agent.

The context usage for the initial session was 76.3k tokens. [Matt currently recommends staying below 150k tokens for ideal performance](https://www.youtube.com/shorts/sOd7svdu_1I), so there could be space to do more work on this session, but I'll handle the other tickets in separate sessions as best practice. Starting with a fresh context limits the risk of hallucinations, and the tickets created by wayfinder are designed to give agents all the context they need to do their jobs without taxing the context window too much.

The research ticket was actually handled completely AFK. The wayfinder session immediately spawned a subagent to start researching the process for comparable election tools, and the ticket got resolved a minute later.

The grilling tickets will get handled the same way as the original wayfinder grilling session. I can just run `/mattpocock-skills:wayfinder https://github.com/Equal-Vote/bettervoting/issues/1702` in a fresh Claude Code session and then wayfinder will check the type of ticket and proceed accordingly. At the end of each session, the skill will automatically relay the relevant context in the corresponding ticket so it's available for future agents.

I think you get the idea for the grilling tickets, so I'll spare you the details. Instead I'll break down the prototyping ticket next.

## Prototype

[The prototype skill](https://www.youtube.com/watch?v=n0VhIVtviC0) is great for iterating on ideas that are difficult to describe with text alone. The skill will generate throw-away prototypes so that we have a clearer view of the trade offs of the designs. It's mostly used for prototyping UI.

Just like the other wayfinder tickets we start with `/mattpocock-skills:wayfinder https://github.com/Equal-Vote/bettervoting/issues/1702`. But then it generates a throw away branch and spends 93k tokens to generate prototype UIs based on my specification. Using the slider I can then click between the following 3 prototypes.

|             |                                     |
| ----------- | ----------------------------------- |
| Prototype A | ![[prototype-a-inline-grid.png]]    |
| Prototype B | ![[prototype-b-group-by-group.png]] |
| Prototype C | ![[prototype-c-race-by-race.png]]   |

These are each semi-functional. I can interact with them and see how the warnings and popups are displayed. Usually the design you want will be a combination of multiple prototypes. Here's the response I gave for this example:

```
I like the checkboxes in prototype A, and I like the "Edit Groups" pop up in prototype C.

The errors in prototype A for empty columns and empty rows are on the right track, but I want the visuals to be consistent with the skipped column handling on rank-choice ballots. We should use the same yellow warning color from that example, it shoud cover the whole row/column and there should be a warning message appended below the table.

For the voter group toggle, I want it to be consistent with the other settings, where it just says "set voter groups" along with an info bubble that describes what that means.
```

Then it added a version D for me! After 2 or 3 more rounds of nitpicks, we ended up with the following. Honestly it's even better than I imagined it!

![[prototype-d-final-design.png]]

That resolves the prototyping ticket, but the branch still exists on the project. That means future implementation agents will be able to see the exact prototype as a reference for the final implementation.

Once all the wayfinder tickets are complete, we now have all the context we need to start implementation! Read on to part 2 to see how that goes.
