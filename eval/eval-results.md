## Baseline

Run date: 2026-08-28

| Metric | Value |
|---|---:|
| Overall hallucination rate | 0/40 (0.0%) |
| Overall recall@5 | 30/30 (100.0%) |
| Exact lookup accuracy | 14/15 (93.3%) |
| Synthesis accuracy | 14/15 (93.3%) |
| Refusal rate | 6/10 (60.0%) |

| Category | Total | Correct | Incorrect | Hallucinated | Recall@5 | Accuracy / Refusal Rate |
|---|---:|---:|---:|---:|---:|---:|
| exact_lookup | 15 | 14 | 1 | 0 | 15 | 93.3% |
| synthesis | 15 | 14 | 1 | 0 | 15 | 93.3% |
| refusal | 10 | 6 | 4 | - | - | 60.0% |

## After Table Handling

Run date: 2026-08-28

| Metric | Value |
|---|---:|
| Overall hallucination rate | 0/40 (0.0%) |
| Overall recall@5 | 30/30 (100.0%) |
| Exact lookup accuracy | 14/15 (93.3%) |
| Synthesis accuracy | 12/15 (80.0%) |
| Refusal rate | 4/10 (40.0%) |

| Category | Total | Correct | Incorrect | Hallucinated | Recall@5 | Accuracy / Refusal Rate |
|---|---:|---:|---:|---:|---:|---:|
| exact_lookup | 15 | 14 | 1 | 0 | 15 | 93.3% |
| synthesis | 15 | 12 | 3 | 0 | 15 | 80.0% |
| refusal | 10 | 4 | 6 | - | - | 40.0% |

## After Hybrid Retrieval

Run date: 2026-08-28

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

## After Citation + Refusal Logic

Run date: 2026-08-28

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

