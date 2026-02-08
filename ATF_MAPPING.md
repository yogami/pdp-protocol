# ATF Compliance Mapping: Veracity Core (PoE-A2A)

> **Agentic Trust Framework Element**: 👁️ **Element 2 — Behavior ("What are you doing?")**
> **ATF Spec**: [github.com/massivescale-ai/agentic-trust-framework](https://github.com/massivescale-ai/agentic-trust-framework)

## ATF Behavior Requirements → Implementation

| ATF Requirement | ATF Description | Implementation Status |
|:---|:---|:---|
| **Structured Logging** | All agent actions logged in machine-parseable format | ✅ Structured PoE artifacts (JSON + Markdown) |
| **Action Attribution** | Every action tied to agent identity and session context | ✅ Ed25519 signed execution records bound to agent keypair |
| **Behavioral Baseline** | Established patterns of normal operation | ✅ Hash-chain linked execution history enables drift detection |
| **Anomaly Detection** | Identification of deviations from expected behavior | ✅ Independent Judge Protocol — isolated LLM validates PoE bundles |
| **Explainability** | Ability to retrieve rationale for agent decisions | ✅ Multi-modal evidence: terminal logs, screenshots, state diffs |

## Beyond ATF: Where PoE Exceeds the Spec

| ATF Says | Veracity Core Does |
|:---|:---|
| "Log behavior" | **Proves it cryptographically** — Ed25519 signatures on every execution record |
| "Monitor for anomalies" | **Independent Judge** — isolated agent validates claims against captured evidence |
| "Structured logging" | **Multi-modal evidence** — terminal logs + screenshots + video + file diffs |
| "Behavioral baseline" | **Hash-chain linking** — tamper-proof execution history anchored to Solana |

## ATF Maturity Level Support

| Agent Level | Supported | How |
|:---|:---|:---|
| **Intern** | ✅ | Read-only PoE verification via `/verify` endpoint |
| **Junior** | ✅ | PoE generation with mandatory human review of walkthrough artifacts |
| **Senior** | ✅ | Full autonomous PoE generation + Solana anchoring |
| **Principal** | ✅ | Cross-agent verification via A2A AgentCard extensions |

## API Endpoints Mapped to ATF

| Endpoint | ATF Function |
|:---|:---|
| `POST /anchor` | Behavioral proof anchoring — submit signed execution record |
| `GET /verify/:hash` | Behavioral verification — validate execution proof |
| `GET /.well-known/agent.json` | A2A AgentCard with PoE capability declarations |
| `GET /health` | Availability monitoring |

## Protocol Standards
- **Signatures**: Ed25519 (sub-5ms verification)
- **Anchoring**: Solana (optional, enterprise-grade audit trail)
- **Hash Chain**: Back-linked SHA-256 with sequence enforcement
- **Interop**: Google A2A AgentCard extension format
- **Audit Status**: Passed adversarial review from 5+ LLM auditors → "Informational Standard Material"

---

*Berlin AI Labs — ATF Reference Implementation*
*[Cloud Security Alliance Agentic Trust Framework](https://cloudsecurityalliance.org/blog/2026/02/02/the-agentic-trust-framework-zero-trust-governance-for-ai-agents)*
