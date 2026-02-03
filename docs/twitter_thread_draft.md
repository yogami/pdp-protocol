# Twitter Thread Draft

## Thread: PoE-A2A Launch

---

**Tweet 1 (Hook)**
Your AI agent has an identity.

But can it prove what it actually did?

Introducing PoE-A2A: Proof of Execution for the Agentic Web 🧵

---

**Tweet 2 (Problem)**
Google A2A tells you WHO an agent is.

But in high-stakes orchestration (finance, legal, infra), you need to know:
- WHAT task was completed
- WHEN it happened  
- WITH cryptographic proof

A2A doesn't verify execution. We fixed that.

---

**Tweet 3 (Solution)**
PoE-A2A adds one field to your AgentCard:

```json
"poe_extension": {
  "version": "PoE-A2A/1.0",
  "signing_key": "ed25519:...",
  "claims_endpoint": "/.well-known/poe-claims.json"
}
```

Now any verifier can fetch your signed execution history.

---

**Tweet 4 (Chain Anchoring)**
For high-value work, anchor your proof hash to Solana.

$0.0001 per anchor.
Sub-second finality.
Immutable audit trail.

No wallet management required — we run the relayer.

---

**Tweet 5 (Live Demo)**
See it live:

AgentCard: https://pdp-protocol-production.up.railway.app/.well-known/agent-card.json

Claims: https://pdp-protocol-production.up.railway.app/.well-known/poe-claims.json

Badge: https://pdp-protocol-production.up.railway.app/.well-known/poe-badge.svg

All running on a $5/mo Railway instance.

---

**Tweet 6 (Rebellion Narrative)**
Why hasn't Google built this?

Because their business model requires YOU to trust THEM.

PoE-A2A is self-hosted verification. No gatekeepers. No registries.

The Mastodon of agent discovery.

---

**Tweet 7 (CTA)**
Deploy the protocol:
🔗 https://github.com/yogami/pdp-protocol

Watch the 82s explainer:
🎬 https://res.cloudinary.com/djol0rpn5/video/upload/v1770156402/poe_a2a_colosseum_presentation_2026.mp4

Add the badge to your README.
Verify your work.

The rebellion will be verified. ✅

---

**Tweet 8 (Tags)**
Built by @BerlinAILabs for the @ColosseumOrg Agent Hackathon.

RFC spec: draft-pdp-a2a-extension-00

#A2A #AgenticWeb #Solana #AI #Agents #WebStandards
