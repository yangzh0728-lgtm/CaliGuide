# Security Policy

CaliGuide handles personal information belonging to immigrants and newcomers,
including dates of birth, nationality, and immigration-adjacent profile fields.
We take reports about that data seriously and appreciate the time researchers
spend on them.

## Reporting a vulnerability

**Please do not open a public GitHub issue for a security problem.** A public
issue discloses the vulnerability to everyone, including people who would use
it, before there is a fix.

Report privately through **GitHub Private Vulnerability Reporting**:

1. Go to the [Security tab](https://github.com/yangzh0728-lgtm/CaliGuide/security)
2. Click **Report a vulnerability**
3. Describe the issue

This creates a private thread visible only to the maintainers.

## What to include

A good report lets us reproduce the problem without guessing:

- What the issue is, and what an attacker could achieve with it
- Step-by-step reproduction, including any required account state
- The affected file, route, or endpoint
- Any proof-of-concept request or payload
- Whether you accessed data belonging to anyone other than yourself

## Response commitment

CaliGuide is maintained by a very small team, so these are realistic rather
than aspirational:

| Stage | Target |
| --- | --- |
| We acknowledge your report | Within 5 business days |
| We give an initial assessment | Within 10 business days |
| We fix or publish a mitigation | Depends on severity; we will keep you updated |

If you have not heard back within 10 business days, please follow up on the
same private thread.

## Scope

**In scope**

- The application code in this repository
- Authentication and session handling
- **Supabase Row Level Security policies.** The database schema and the
  publishable anon key are public by design, so RLS is the boundary that
  protects user data. Reports of policies that allow a user to read or modify
  another user's rows are the highest-value reports we can receive.
- Server API routes under `/api/*`, including uploads, forum mutations,
  translation, chat, and client error reporting
- Cloudflare R2 object key handling and access scoping
- Cross-site scripting, CSRF, injection, and access-control flaws

**Out of scope**

- Vulnerabilities in third-party services themselves — report those to
  Supabase, Cloudflare, Baidu Qianfan, or Mem0 directly
- Missing security headers with no demonstrated impact
- Automated scanner output with no working proof of concept
- Social engineering of maintainers or users
- Denial of service and volumetric testing
- Reports that the anon key or Supabase project URL are publicly visible; these
  are public by design and protected by RLS

## Testing rules

**Do not test against production with data that is not yours.** Real accounts
hold immigration-adjacent personal information. If a vulnerability appears
exploitable against other users' data, stop and report it rather than
confirming the impact.

Please also:

- Use your own test accounts
- Do not run automated scanners against production
- Do not access, modify, download, or retain another person's data
- Do not degrade the service for other users

## Safe harbor

If you follow this policy in good faith, we will not pursue or support legal
action against you for your research, and we will work with you to understand
and resolve the issue quickly. If a third party brings action against you for
research conducted under this policy, we will make it known that your
activities were authorized.

## Rewards

We do not currently run a paid bug bounty. We will credit you in the fix
commit and in any advisory, if you would like to be named.

## Supported versions

Only the current `main` branch is supported. There are no maintained release
branches.
