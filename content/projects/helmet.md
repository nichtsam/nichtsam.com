---
name: Helmet
startedYear: 2025
role: Author, maintainer
stack:
  - TypeScript
  - Web Fetch API
  - Node http
links:
  - title: npm
    href: https://www.npmjs.com/package/@nichtsam/helmet
  - title: GitHub
    href: https://github.com/nichtsam/helmet
stories:
  - date: 2025-02
    title: Found CSP on routes that weren’t HTML
    body:
      While contributing to the Epic Stack, an open-source starter for
      full-stack web apps, I noticed Express Helmet set every header on every
      response, so HTML-only headers like Content-Security-Policy landed on
      routes that weren’t HTML. I opened an issue for it.
    links:
      - title: 'Issue #920'
        href: https://github.com/epicweb-dev/epic-stack/issues/920
    open: true
  - date: 2025-02
    title: Headers grouped by where they apply
    body:
      A first fix lived inside the stack itself. The second attempt pulled it
      out into a package, @nichtsam/helmet, which splits headers into three
      groups — general, content, and resource sharing — so each response only
      gets the ones that apply to it.
  - date: 2025-02
    title: Merged into the Epic Stack
    body:
      The PR replacing Express Helmet with it was merged, so every app started
      from the Epic Stack now ships with it.
    links:
      - title: 'PR #927'
        href: https://github.com/epicweb-dev/epic-stack/pull/927
  - date: 2026-08
    title: Reached 50k downloads a month
    body: The first 10k a month came three months after release.
---

Security headers for Fetch API and Node responses, applied only where they make
sense instead of everywhere at once.
