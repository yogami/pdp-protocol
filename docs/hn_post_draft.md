# Hacker News Post Draft

## Title
**I built an HTTP-first agent verification protocol after Google's A2A left execution unverifiable**

---

## Post Body

I work on AI agents for a living. Last year, I watched Google release A2A (Agent-to-Agent) and thought: "Finally, a standard for agent discovery."

Then I realized the problem: A2A tells you *who* an agent is, but not *what it actually did*.

In high-stakes orchestration (finance, legal, infra), you can't just take an agent's word for it. You need cryptographic proof that Task X was completed with Output Y at Time Z.

So I built **PoE-A2A** — a lightweight HTTP extension that adds verifiable execution claims to any AgentCard.

**How it works:**

1. Agent completes a task
2. Agent signs a claim: `{task_hash, output_hash, timestamp, signature}`
3. Agent publishes claims at `/.well-known/poe-claims.json`
4. (Optional) Anchor the hash to Solana for immutable audit trail

**No blockchain required for basic use.** The chain anchoring is purely optional for high-value work.

**Why not just use signatures?**

Signatures alone don't give you:
- A standard discovery location (A2A compatibility)
- Expiration/revocation semantics
- Chain anchoring for legal-grade audits

**Live Demo:**
- AgentCard: https://pdp-protocol-production.up.railway.app/.well-known/agent-card.json
- Claims: https://pdp-protocol-production.up.railway.app/.well-known/poe-claims.json

**RFC Spec:** https://github.com/yogami/pdp-protocol/blob/main/docs/draft-pdp-a2a-extension-00.txt

The spec passed adversarial review from 5 different LLMs (DeepSeek-R1, GPT-4o, Claude, Qwen, Perplexity) and reached "Informational Standard Material" status.

**What's next:**
- IETF submission as Informational Draft
- Integration with Moltbook (200K+ agents)
- "Verified Indie" GitHub badge for READMEs

I'm curious what the HN community thinks. Is execution verification a real problem you've hit? Or is this solving a problem that doesn't exist yet?

---
*Built by Berlin AI Labs. MIT licensed.*
