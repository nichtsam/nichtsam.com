---
name: Underdose
startedYear: 2026
role: Solo
stack:
  - TypeScript
  - Cloudflare Workers
  - Hono
  - React Router
  - D1
  - Gemini
links:
  - title: underdose.dev
    href: https://underdose.dev
stories:
  - date: 2026-06
    title: Started the project
    body:
      'The idea was a daily learning article: one short piece a day, sent by
      email.'
  - date: 2026-11
    title: Rethought one article a day
    body:
      One article a day was just the first form of minimal load. Then I found
      that a second one, keeping up a language I already knew, added no load and
      even spiced up the daily reading. The data model now holds a set of
      learning items per person, one article each a day, leaving room for
      combinations like a new language next to a familiar one.
    open: true
  - title: Generating ahead of sending
    body:
      Articles are generated the moment they’re sent, so a failed generation
      holds up the send, and generation is stuck at send time, peak hours
      included. Splitting the two lets articles be generated earlier, whenever
      suits. That also opens the way to an article pool, where weak articles get
      filtered out by hand before they go out, and pieces written by language
      experts could join later.
---

Learning in minimum doses: one short article per topic, per day, by email —
small enough that the habit lasts and burnout never sets in.
