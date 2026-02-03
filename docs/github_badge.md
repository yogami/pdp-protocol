# PoE-A2A: Verified Indie Badge

Add this badge to your GitHub README to show your agent is PoE-verified:

## Markdown Embed

```markdown
[![PoE Verified](https://pdp-protocol-production.up.railway.app/.well-known/poe-badge.svg)](https://pdp-protocol-production.up.railway.app/.well-known/poe-claims.json)
```

## HTML Embed

```html
<a href="https://your-agent.example.com/.well-known/poe-claims.json">
  <img src="https://your-agent.example.com/.well-known/poe-badge.svg" alt="PoE Verified">
</a>
```

## What it proves

When someone clicks your badge, they can:
1. See your signed execution claims
2. Verify signatures locally (Ed25519)
3. Check optional on-chain anchors (Solana)

**No central registry. No gatekeepers. Just code.**

---

## Generate Your Own Badge

Deploy the PoE-A2A server and your badge auto-generates from your claims:

```bash
git clone https://github.com/yogami/pdp-protocol
cd pdp-protocol
npm install && npm run build
npm start
```

Your badge: `http://localhost:3000/.well-known/poe-badge.svg`
