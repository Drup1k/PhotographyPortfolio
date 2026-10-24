---
applyTo: "**"
description: "Secure coding, privacy-by-design and conditional compliance checks for Photography Portfolio"
---

# Security, Privacy and Compliance

Follow PLAN.md and the project-wide Copilot instructions. Prefer simple, secure solutions.
Treat compliance rules as implementation checkpoints, not a claim that the website is legally compliant.
Do not add future functionality before it is requested.

## Security baseline — from the start

- Never hardcode or commit passwords, API keys, tokens, or private credentials.
- Keep environment-specific secrets outside source control.
- Avoid unnecessary packages, remote scripts, trackers and third-party services.
- Review added dependencies for known vulnerabilities; keep lockfiles under version control.
- Treat user input as untrusted. Validate it on the server when backend logic is involved.
- Use safe React text rendering; avoid `dangerouslySetInnerHTML` for untrusted content.
- Use parameterized SQL queries or a safe ORM; never concatenate user input into SQL.
- Use HTTPS in production and secure defaults for configuration.
- Never expose stack traces, private data or server internals to visitors.
- Protect sensitive endpoints with appropriate authorization and rate limiting when needed.
- Check authorization on the server, not just by hiding controls in the React UI.

## Third-party resources and fonts

- Self-host website fonts instead of loading Google Fonts or other font services from third-party servers at page load.
- Check font licensing before including a font file.
- Review third-party scripts, embedded media, analytics, CDNs and external widgets for data disclosure, security and privacy impacts.
- Do not add non-essential external integrations without explaining their purpose and required privacy choices.

## Cookies, analytics and session replay

- Do not introduce analytics, advertising trackers or session replay by default.
- Only load non-essential tracking technologies after the legally required, valid user consent.
- Allow users to refuse or withdraw consent without breaking essential site functionality.
- If session replay is explicitly requested later, assess necessity and privacy risks, and mask or exclude form entries, identifying information and sensitive content.
- Do not confuse essential authentication/session cookies with session-replay recordings.
- Do not implement a cookie banner merely as decoration; consent choices must control actual tracking behavior.

## Personal data, photo rights and uploads

- Collect only information necessary for the current feature; document its purpose and retention approach.
- Do not publish identifiable client portraits unless the appropriate publication permission or other valid legal justification has been established.
- Treat permission to take a photograph and permission to publish it as separate matters.
- Apply additional care to photographs of minors and to potentially sensitive location/EXIF metadata.
- For future photo uploads: validate file type and size, avoid trusting filenames, prevent executable uploads, and limit access to private photos.
- Do not expose booking or customer records in public endpoints or logs.
- Recheck privacy notices, access, deletion and retention requirements before collecting real visitor/customer data.

## Registration and children — only if accounts are introduced

- Do not collect dates of birth or introduce age gates without a demonstrated need.
- Before implementing registration, identify the intended users, legal age/consent rules and applicable jurisdictions.
- When children's consent is legally relevant, implement age-appropriate protections and parental-consent flows where required.
- Never assume that a universal 18+ rule applies to every account.

## Contact, newsletters and emails — when enabled

- Clearly distinguish transactional emails (e.g. booking confirmations) from marketing messages.
- Before marketing emails, establish the appropriate legal basis and respect applicable e-marketing rules.
- Provide a clear, functioning and easy-to-use unsubscribe option in marketing emails.
- Do not silently subscribe contact-form users or customers to a mailing list.
- Limit personal information in email contents and logs.

## Payments and recurring charges — only if enabled

- Before a payment, clearly show the full price, taxes and compulsory fees.
- If recurring billing is introduced, prominently disclose renewal price, interval, duration and cancellation terms before the user confirms payment.
- Clearly label any button that creates a payment obligation.
- Do not add paid subscriptions or auto-renewal functionality unless requested.

## Copyright and DMCA

- Use photos and third-party assets only with the necessary rights or licenses.
- Do not assume that a US DMCA designated-agent registration is required for an ordinary Belgian photography portfolio.
- Reassess platform/user-upload copyright obligations if the website later hosts third-party user-submitted content.

## Validation before completing relevant tasks

For each new feature or major change, report:
1. What data is collected, transferred, stored or published?
2. Which external services, fonts or scripts are loaded?
3. What input validation and access controls are needed?
4. Are consent, unsubscribe, age or payment disclosures applicable?
5. Have relevant security checks actually been run, or are they still pending?
6. What concrete issue must be fixed before release?

Report confirmed issues separately from potential risks. Never claim that compliance or security has been fully verified merely because these instructions were followed.
