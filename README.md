# Panama City Budget Gap

Independent worksheet for the City of Panama City General Fund after Florida Amendment 3. Not a City of Panama City website.

Figures are the FY 2027 adopted budget and the Bay County Property Appraiser loss estimates reported June 25, 2026.

## Public site

GitHub Pages serves the static build in `docs/`.

Until a custom domain is attached, the address is:

https://beegee1006.github.io/panama-city-budget-gap/

Pages source: **Deploy from a branch**, branch `main`, folder `/docs`.

## Custom .app domain

`.app` domains require HTTPS. GitHub Pages issues the certificate after DNS checks out.

At the DNS host, for the apex name:

| Type | Value |
|---|---|
| A | 185.199.108.153 |
| A | 185.199.109.153 |
| A | 185.199.110.153 |
| A | 185.199.111.153 |
| AAAA | 2606:50c0:8000::153 |
| AAAA | 2606:50c0:8001::153 |
| AAAA | 2606:50c0:8002::153 |
| AAAA | 2606:50c0:8003::153 |

Then add the domain under the repository's Pages settings, and commit it as `docs/CNAME` (one line, the bare domain).

## Build the page locally

```bash
npm install
npx vite build --config vite.pages.config.ts
```

Output is `docs/`.
