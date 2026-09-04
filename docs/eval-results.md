## Before: Previously Reported Hybrid Run

Run date: 2026-08-28
Deployment: https://rag-pricing-assistant-e1ee8ureg-rehandesign35s-projects.vercel.app
Deployment ID: dpl_6gwoCxyFov8ZGwaCizNrZCr9r5ZY

| Metric | Value |
|---|---:|
| Overall hallucination rate | 0/40 (0.0%) |
| Overall recall@5 | 28/30 (93.3%) |
| Exact lookup accuracy | 14/15 (93.3%) |
| Synthesis accuracy | 11/15 (73.3%) |
| Citation accuracy | 0/28 (0.0%) |
| Refusal recall | 9/10 (90.0%) |
| Refusal precision | 9/11 (81.8%) |

## After clean hybrid retrieval

Run date: 2026-09-04T02:59:27.965Z
Git commit: 6DUbfLPjjvQ2yx3wEFHXU1wVhbBR (Vercel deployment)
Deployment: https://rag-pricing-assistant.vercel.app

| Metric | Value |
|---|---:|
| Overall hallucination rate | 0/40 (0.0%) |
| Overall recall@5 | 28/30 (93.3%) |
| Exact lookup accuracy | 14/15 (93.3%) |
| Synthesis accuracy | 11/15 (73.3%) |
| Citation accuracy | 0/28 (0.0%) |
| Refusal recall | 9/10 (90.0%) |
| Refusal precision | 9/11 (81.8%) |

| Category | Total | Correct | Incorrect | Hallucinated | Recall@5 | Accuracy / Refusal Rate |
|---|---:|---:|---:|---:|---:|---:|
| exact_lookup | 15 | 14 | 1 | 0 | 14 | 93.3% |
| synthesis | 15 | 11 | 4 | 0 | 14 | 73.3% |
| refusal | 10 | 9 | 1 | - | - | 90.0% |

## Comparison

The before and after records are separate production deployment states and separate full 40-question runs. No meaningful change was measured: every reported metric is identical. Citation accuracy remains 0/28 (0.0%), so the parser fix corrected the harness boundary but did not improve the deployed model's citation behavior.

